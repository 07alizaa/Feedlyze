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
