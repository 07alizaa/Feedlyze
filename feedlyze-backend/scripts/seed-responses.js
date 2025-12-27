// scripts/seed-responses.js
// Run with: node scripts/seed-responses.js

require('dotenv').config();
const { query, pool } = require('../src/config/database');

const SURVEY_ID = 1;
const BUSINESS_ID = 1;

// Sample feedback data - varied sentiments
const sampleResponses = [
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'Yes, definitely!' },
      { question_id: 4, answer_text: 'Amazing experience! The staff was super friendly and the service was quick.' },
      { question_id: 2, answer_text: 'I loved the ambiance and the quality of food was excellent.' }
    ]
  },
  {
    device_type: 'tablet',
    answers: [
      { question_id: 3, answer_choice: 'Yes, definitely!' },
      { question_id: 4, answer_text: 'Great place! Will recommend to friends.' },
      { question_id: 2, answer_text: 'The coffee was perfect and the prices are reasonable.' }
    ]
  },
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'Maybe' },
      { question_id: 4, answer_text: 'It was okay, nothing special. The wait time was a bit long.' },
      { question_id: 2, answer_text: 'The location is convenient but parking is difficult.' }
    ]
  },
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'No' },
      { question_id: 4, answer_text: 'Very disappointed. The food was cold and service was slow.' },
      { question_id: 2, answer_text: 'Nothing really stood out. Staff seemed uninterested.' }
    ]
  },
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'Yes, definitely!' },
      { question_id: 4, answer_text: 'Best coffee in town! Love the cozy atmosphere.' },
      { question_id: 2, answer_text: 'The barista was very knowledgeable about different coffee types.' }
    ]
  },
  {
    device_type: 'tablet',
    answers: [
      { question_id: 3, answer_choice: 'Maybe' },
      { question_id: 4, answer_text: 'Decent experience. Food was good but a bit overpriced.' },
      { question_id: 2, answer_text: 'The interior design is nice but music was too loud.' }
    ]
  },
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'Yes, definitely!' },
      { question_id: 4, answer_text: 'Wonderful! Clean place, friendly staff, delicious pastries.' },
      { question_id: 2, answer_text: 'The fresh baked goods and the aroma of coffee.' }
    ]
  },
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'No' },
      { question_id: 4, answer_text: 'Terrible experience. Wrong order twice and rude manager.' },
      { question_id: 2, answer_text: 'Honestly, nothing. I had a very bad experience today.' }
    ]
  },
  {
    device_type: 'tablet',
    answers: [
      { question_id: 3, answer_choice: 'Yes, definitely!' },
      { question_id: 4, answer_text: 'Love this place! Fast wifi, great for working remotely.' },
      { question_id: 2, answer_text: 'The quiet corners perfect for meetings and the coffee quality.' }
    ]
  },
  {
    device_type: 'mobile',
    answers: [
      { question_id: 3, answer_choice: 'Maybe' },
      { question_id: 4, answer_text: 'Average experience. Nothing bad but nothing memorable either.' },
      { question_id: 2, answer_text: 'The drink selection is good.' }
    ]
  }
];

// Get question text for each question
async function getQuestionTexts() {
  const result = await query('SELECT id, question_text, question_type FROM questions WHERE survey_id = $1', [SURVEY_ID]);
  const map = {};
  result.rows.forEach(q => {
    map[q.id] = { text: q.question_text, type: q.question_type };
  });
  return map;
}

async function seedResponses() {
  console.log('🌱 Seeding test responses...\n');

  try {
    const questionMap = await getQuestionTexts();
    let successCount = 0;

    for (let i = 0; i < sampleResponses.length; i++) {
      const data = sampleResponses[i];

      // Create response
      const responseResult = await query(
        `INSERT INTO responses (survey_id, business_id, device_type, submitted_at)
         VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days')
         RETURNING id`,
        [SURVEY_ID, BUSINESS_ID, data.device_type]
      );

      const responseId = responseResult.rows[0].id;

      // Create answers
      for (const answer of data.answers) {
        const q = questionMap[answer.question_id];
        if (!q) continue;

        await query(
          `INSERT INTO answers (response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            responseId,
            answer.question_id,
            q.text,
            q.type,
            answer.answer_text || null,
            answer.answer_rating || null,
            answer.answer_choice || null
          ]
        );
      }

      // Update survey response count
      await query('UPDATE surveys SET response_count = response_count + 1 WHERE id = $1', [SURVEY_ID]);

      console.log(`✅ Response #${responseId} created (${data.device_type})`);
      successCount++;
    }

    console.log(`\n🎉 Done! Created ${successCount} responses.`);
    console.log('\n📋 Next steps:');
    console.log('   1. Run AI analysis: POST /api/analysis/survey/1');
    console.log('   2. Generate insights: POST /api/insights/generate');
    console.log('   3. View dashboard: GET /api/insights/dashboard');

  } catch (error) {
    console.error('❌ Error seeding responses:', error.message);
  } finally {
    await pool.end();
  }
}

seedResponses();
