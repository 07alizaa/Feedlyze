const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');
const Survey = require('../models/Survey');
const Question = require('../models/Question');
const { generateQRCode } = require('./qrService');
const logger = require('../utils/logger');

// Lazy initialization - get API keys when needed (after dotenv loads)
const getGeminiKeys = () => (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
const getHfKey = () => process.env.HF_API_KEY;
const getOpenAIKey = () => process.env.OPENAI_API_KEY;
const getGroqKey = () => process.env.GROQ_API_KEY;
const getGenAIs = () => getGeminiKeys().map(key => new GoogleGenerativeAI(key));
const getOpenAI = () => {
  const key = getOpenAIKey();
  return key ? new OpenAI({ apiKey: key }) : null;
};
const getGroq = () => {
  const key = getGroqKey();
  return key ? new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' }) : null;
};

// Store conversation history per user session
const conversationHistory = new Map();

// System prompt for survey creation assistant
const SYSTEM_PROMPT = `You are Feedlyze AI, a helpful assistant that helps businesses create customer feedback surveys.

Your job is to:
1. Understand what kind of feedback the business wants to collect
2. Suggest appropriate questions based on their industry and goals
3. Help them refine questions
4. When they're ready, generate a complete survey

RULES:
- Be conversational and helpful
- Ask clarifying questions if needed
- Suggest 3-5 questions typically
- Support these question types: rating (1-5 stars), text (open-ended), mcq (multiple choice)
- When the user says they're ready or asks to create/generate the survey, output the survey in JSON format

When generating the final survey, respond with ONLY a JSON object in this exact format:
{
  "action": "CREATE_SURVEY",
  "survey": {
    "title": "Survey Title",
    "description": "Brief description",
    "questions": [
      {
        "question_text": "Question here?",
        "question_type": "rating|text|mcq",
        "is_required": true,
        "options": ["Option 1", "Option 2"] // only for mcq type
      }
    ]
  }
}

If you're still in conversation mode (not creating yet), respond naturally without JSON.`;

/**
 * Get or create conversation history for a user
 */
const getConversation = (userId) => {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
};

/**
 * Clear conversation history for a user
 */
const clearConversation = (userId) => {
  conversationHistory.delete(userId);
};

/**
 * Process a chat message and get AI response
 */
const processMessage = async (userId, message, businessContext = {}) => {
  const conversation = getConversation(userId);
  // Add context about the business if available
  let contextMessage = '';
  if (businessContext.businessName) {
    contextMessage = `\n\nBusiness context: ${businessContext.businessName}`;
    if (businessContext.industry) {
      contextMessage += ` (Industry: ${businessContext.industry})`;
    }
  }

  // First message includes system prompt
  const fullMessage = conversation.length === 0 
    ? `${SYSTEM_PROMPT}${contextMessage}\n\nUser: ${message}`
    : message;

  // Get API keys at runtime (after dotenv loads)
  const genAIs = getGenAIs();
  const hfKey = getHfKey();

  logger.info(`Gemini keys count: ${genAIs.length}, HF key set: ${!!hfKey}`);

  // Try all Gemini keys in order
  for (let i = 0; i < genAIs.length; i++) {
    try {
      const model = genAIs[i].getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        history: conversation.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });
      const result = await chat.sendMessage(fullMessage);
      const response = result.response.text();
      conversation.push({ role: 'user', content: message });
      conversation.push({ role: 'model', content: response });
      const surveyData = extractSurveyData(response);
      return {
        message: surveyData ? 'Survey is ready to be created!' : response,
        surveyData: surveyData,
        conversationId: `conv_${userId}_${Date.now()}`
      };
    } catch (error) {
      logger.error(`Gemini key ${i + 1} failed:`, error.message);
      // Try next Gemini key
    }
  }

  // Fallback to Groq (FREE and fast!)
  const groq = getGroq();
  if (groq) {
    try {
      logger.info('Trying Groq API (free tier)...');
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + contextMessage },
        ...conversation.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];
      
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      const response = completion.choices[0].message.content;
      conversation.push({ role: 'user', content: message });
      conversation.push({ role: 'model', content: response });
      const surveyData = extractSurveyData(response);
      return {
        message: surveyData ? 'Survey is ready to be created!' : response,
        surveyData: surveyData,
        conversationId: `conv_${userId}_${Date.now()}`
      };
    } catch (error) {
      logger.error('Groq error:', error.message);
    }
  }

  // Fallback to OpenAI
  const openai = getOpenAI();
  if (openai) {
    try {
      logger.info('Trying OpenAI API...');
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + contextMessage },
        ...conversation.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      const response = completion.choices[0].message.content;
      conversation.push({ role: 'user', content: message });
      conversation.push({ role: 'model', content: response });
      const surveyData = extractSurveyData(response);
      return {
        message: surveyData ? 'Survey is ready to be created!' : response,
        surveyData: surveyData,
        conversationId: `conv_${userId}_${Date.now()}`
      };
    } catch (error) {
      logger.error('OpenAI error:', error.message);
    }
  }

  // Fallback to Hugging Face Inference API (text-generation)
  if (hfKey) {
    try {
      // Compose prompt with history for context
      const historyText = conversation.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
      const prompt = `${SYSTEM_PROMPT}${contextMessage}\n${historyText}\nUser: ${message}\nAssistant:`;
      const hfResponse = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
        { inputs: prompt, parameters: { max_new_tokens: 512, temperature: 0.7 } },
        { headers: { Authorization: `Bearer ${hfKey}` } }
      );
      const response = hfResponse.data && hfResponse.data.generated_text
        ? hfResponse.data.generated_text
        : (hfResponse.data[0] && hfResponse.data[0].generated_text) || '[No response]';
      conversation.push({ role: 'user', content: message });
      conversation.push({ role: 'model', content: response });
      const surveyData = extractSurveyData(response);
      return {
        message: surveyData ? 'Survey is ready to be created!' : response,
        surveyData: surveyData,
        conversationId: `conv_${userId}_${Date.now()}`
      };
    } catch (error) {
      logger.error('Hugging Face error:', error.message);
      throw new Error('All AI APIs (Gemini, OpenAI, Hugging Face) failed.');
    }
  }

  throw new Error('No AI API key configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or HF_API_KEY.');
};

/**
 * Extract survey JSON from AI response
 */
const extractSurveyData = (response) => {
  try {
    // Look for JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*"action"[\s\S]*"CREATE_SURVEY"[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.action === 'CREATE_SURVEY' && parsed.survey) {
        return parsed.survey;
      }
    }
    
    // Also try to find just the survey object
    const surveyMatch = response.match(/\{[\s\S]*"title"[\s\S]*"questions"[\s\S]*\]/);
    if (surveyMatch) {
      const parsed = JSON.parse(surveyMatch[0] + '}');
      if (parsed.title && parsed.questions) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Create survey from chatbot conversation
 */
const createSurveyFromChat = async (businessId, surveyData) => {
  try {
    // Generate short code
    const shortCode = Math.random().toString(36).substring(2, 8);
    
    // Generate QR code
    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/s/${shortCode}`;
    const qrCodeUrl = await generateQRCode(publicUrl);

    // Create survey
    const survey = await Survey.create({
      business_id: businessId,
      title: surveyData.title,
      description: surveyData.description || '',
      short_code: shortCode,
      qr_code_url: qrCodeUrl
    });

    // Create questions
    const questions = [];
    for (let i = 0; i < surveyData.questions.length; i++) {
      const q = surveyData.questions[i];
      const question = await Question.create({
        survey_id: survey.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        is_required: q.is_required !== false,
        display_order: i + 1
      });
      questions.push(question);
    }

    // Clear conversation after successful creation
    clearConversation(businessId);

    return {
      ...survey,
      questions,
      public_url: publicUrl
    };

  } catch (error) {
    logger.error('Error creating survey from chat:', error);
    throw error;
  }
};

/**
 * Get conversation history for a user
 */
const getConversationHistory = (userId) => {
  const conversation = conversationHistory.get(userId) || [];
  return conversation.map((msg, index) => ({
    id: index,
    role: msg.role === 'model' ? 'assistant' : msg.role,
    content: msg.content
  }));
};

/**
 * Quick survey suggestions based on industry
 */
const getSuggestions = (industry) => {
  const suggestions = {
    'Food & Beverage': [
      'What type of feedback do you want to collect?',
      'What aspects of your restaurant should I ask about?',
      'How many questions do you need in your survey?'
    ],
    'Retail': [
      'What type of feedback do you want to collect?',
      'What aspects of your store should I ask about?',
      'How many questions do you need in your survey?'
    ],
    'Healthcare': [
      'What type of feedback do you want to collect?',
      'What aspects of patient experience should I ask about?',
      'How many questions do you need in your survey?'
    ],
    'Hospitality': [
      'What type of feedback do you want to collect?',
      'What aspects of guest experience should I ask about?',
      'How many questions do you need in your survey?'
    ],
    'default': [
      'What type of feedback do you want to collect?',
      'What aspects of your business should I ask about?',
      'How many questions do you need in your survey?'
    ]
  };

  return suggestions[industry] || suggestions['default'];
};

module.exports = {
  processMessage,
  createSurveyFromChat,
  clearConversation,
  getConversationHistory,
  getSuggestions
};
