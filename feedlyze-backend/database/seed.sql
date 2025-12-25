-- database/seed.sql
-- Sample test data for development

-- Insert a test business
INSERT INTO businesses (business_name, email, password_hash, industry, phone)
VALUES (
  'Test Restaurant',
  'test@feedlyze.com',
  '$2b$10$XQfh5aNgYdH5qYZK.WKzGO7qJ5VyXGH9jKNmVP2F3HNQQqxKFjXYi', -- password: "password123"
  'Food & Beverage',
  '9876543210'
);

-- Insert a test survey
INSERT INTO surveys (business_id, title, description, short_code, qr_code_url)
VALUES (
  1,
  'Customer Satisfaction Survey',
  'Help us improve our service!',
  'test123',
  'https://example.com/qr/test123.png'
);

-- Insert test questions
INSERT INTO questions (survey_id, question_text, question_type, is_required, display_order)
VALUES 
  (1, 'How would you rate our service?', 'rating', true, 1),
  (1, 'What did you like most about your visit?', 'text', false, 2),
  (1, 'Would you recommend us to others?', 'mcq', true, 3);

-- Update MCQ options for question 3
UPDATE questions 
SET options = '["Yes, definitely", "Maybe", "No"]'::jsonb
WHERE id = 3;

-- ==========================================
-- PHASE 3: Test Responses and Answers
-- ==========================================

-- Insert test responses
INSERT INTO responses (survey_id, business_id, device_type, ai_analyzed)
VALUES 
  (1, 1, 'mobile', false),
  (1, 1, 'desktop', false),
  (1, 1, 'tablet', false);

-- Update survey response count
UPDATE surveys SET response_count = 3 WHERE id = 1;

-- Insert test answers for response 1
INSERT INTO answers (response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice)
VALUES 
  (1, 1, 'How would you rate our service?', 'rating', NULL, 5, NULL),
  (1, 2, 'What did you like most about your visit?', 'text', 'The food was amazing and staff were very friendly!', NULL, NULL),
  (1, 3, 'Would you recommend us to others?', 'mcq', NULL, NULL, 'Yes, definitely');

-- Insert test answers for response 2
INSERT INTO answers (response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice)
VALUES 
  (2, 1, 'How would you rate our service?', 'rating', NULL, 4, NULL),
  (2, 2, 'What did you like most about your visit?', 'text', 'Quick service and good ambiance.', NULL, NULL),
  (2, 3, 'Would you recommend us to others?', 'mcq', NULL, NULL, 'Maybe');

-- Insert test answers for response 3
INSERT INTO answers (response_id, question_id, question_text, answer_type, answer_text, answer_rating, answer_choice)
VALUES 
  (3, 1, 'How would you rate our service?', 'rating', NULL, 3, NULL),
  (3, 2, 'What did you like most about your visit?', 'text', 'Food was okay but the wait time was too long.', NULL, NULL),
  (3, 3, 'Would you recommend us to others?', 'mcq', NULL, NULL, 'Maybe');

