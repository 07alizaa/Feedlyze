// src/pages/ai-assistant/AIAssistant.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Plus,
  ClipboardList,
  Lightbulb,
  Star,
  AlignLeft,
  ListChecks,
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import toast from 'react-hot-toast';

const AIAssistant = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [generatedSurvey, setGeneratedSurvey] = useState(null);
  const [creatingSurvey, setCreatingSurvey] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi there! 👋 I'm Feedlyze AI, your survey creation assistant. Tell me about your business and what kind of feedback you want to collect, and I'll help you create the perfect survey!\n\nFor example, you could say:\n- "I run a restaurant and want feedback on our food and service"\n- "Create a customer satisfaction survey for my hotel"\n- "Help me make a survey to understand why customers leave"`,
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/chatbot/suggestions');
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setGeneratedSurvey(null);

    try {
      const response = await api.post('/chatbot/message', {
        message: messageText.trim(),
      });

      const { message: aiMessage, surveyData } = response.data.data;

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiMessage,
        surveyData: surveyData,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (surveyData) {
        setGeneratedSurvey(surveyData);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again in a moment.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateSurvey = async () => {
    if (!generatedSurvey) return;

    try {
      setCreatingSurvey(true);
      const response = await api.post('/chatbot/create-survey', {
        surveyData: generatedSurvey,
      });

      toast.success('Survey created successfully!');
      navigate(`/surveys/${response.data.data.id}`);
    } catch (error) {
      console.error('Create survey error:', error);
      toast.error('Failed to create survey. Please try again.');
    } finally {
      setCreatingSurvey(false);
    }
  };

  const handleResetConversation = async () => {
    try {
      await api.post('/chatbot/reset');
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: "Let's start fresh! Tell me about your business and what feedback you'd like to collect.",
        },
      ]);
      setGeneratedSurvey(null);
      toast.success('Conversation reset');
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'rating':
        return <Star className="w-4 h-4 text-warning-500" />;
      case 'text':
        return <AlignLeft className="w-4 h-4 text-primary-500" />;
      case 'mcq':
        return <ListChecks className="w-4 h-4 text-success-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-900">AI Survey Assistant</h1>
            <p className="text-sm text-dark-500">
              Describe your needs, I'll create the perfect survey
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={handleResetConversation}
        >
          New Chat
        </Button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-light-200 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : message.isError
                      ? 'bg-danger-50 text-danger-700'
                      : 'bg-light-100 text-dark-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Survey Preview in Message */}
                  {message.surveyData && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-light-200">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="w-5 h-5 text-primary-500" />
                        <span className="font-semibold text-dark-900">
                          {message.surveyData.title}
                        </span>
                      </div>
                      {message.surveyData.description && (
                        <p className="text-sm text-dark-500 mb-3">
                          {message.surveyData.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        {message.surveyData.questions?.map((q, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            {getQuestionTypeIcon(q.question_type)}
                            <span className="text-dark-700">{q.question_text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-light-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <span
                      className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show when no messages except welcome) */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-sm text-dark-500 mb-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-light-100 hover:bg-light-200 text-dark-600 text-sm rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-light-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe the survey you want to create..."
                className="flex-1 px-4 py-3 bg-light-50 border border-light-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <Button
                type="submit"
                icon={Send}
                disabled={!inputValue.trim() || loading}
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Survey Preview Panel */}
        {generatedSurvey && (
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-0">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h2 className="font-semibold text-dark-900">Generated Survey</h2>
              </div>

              <div className="bg-light-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-dark-900 mb-1">
                  {generatedSurvey.title}
                </h3>
                {generatedSurvey.description && (
                  <p className="text-sm text-dark-500 mb-3">
                    {generatedSurvey.description}
                  </p>
                )}

                <div className="space-y-3">
                  {generatedSurvey.questions?.map((question, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-light-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-dark-800">
                            {question.question_text}
                          </p>
                          <Badge
                            variant={
                              question.question_type === 'rating'
                                ? 'warning'
                                : question.question_type === 'mcq'
                                ? 'success'
                                : 'primary'
                            }
                            size="sm"
                            className="mt-2"
                          >
                            {question.question_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  icon={Plus}
                  onClick={handleCreateSurvey}
                  loading={creatingSurvey}
                >
                  Create This Survey
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setInputValue("Can you modify the questions? I'd like to...");
                    inputRef.current?.focus();
                  }}
                >
                  Refine Further
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
