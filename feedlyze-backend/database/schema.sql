-- =====================================================
-- FEEDLYZE DATABASE SCHEMA (MVP VERSION)
-- =====================================================

-- =====================================================
-- TABLE 1: BUSINESSES
-- =====================================================
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE 2: SURVEYS
-- =====================================================
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    qr_code_url TEXT,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    response_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE 3: QUESTIONS
-- =====================================================
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options JSONB,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER NOT NULL
);

-- =====================================================
-- TABLE 4: RESPONSES
-- =====================================================
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    device_type VARCHAR(50),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_analyzed BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- TABLE 5: ANSWERS
-- =====================================================
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_type VARCHAR(50) NOT NULL,
    answer_text TEXT,
    answer_rating INTEGER,
    answer_choice VARCHAR(255)
);

-- =====================================================
-- TABLE 6: AI_ANALYSIS
-- =====================================================
CREATE TABLE ai_analysis (
    id SERIAL PRIMARY KEY,
    response_id INTEGER UNIQUE NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    sentiment_score DECIMAL(3, 2),
    sentiment_label VARCHAR(50),
    entities JSONB,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE 7: INSIGHTS
-- =====================================================
CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_responses INTEGER DEFAULT 0,
    positive_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,
    avg_sentiment_score DECIMAL(3, 2),
    top_themes JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for faster business lookups
CREATE INDEX idx_businesses_email ON businesses(email);

-- Index for faster survey queries
CREATE INDEX idx_surveys_business_id ON surveys(business_id);
CREATE INDEX idx_surveys_short_code ON surveys(short_code);
CREATE INDEX idx_surveys_is_active ON surveys(is_active);

-- Index for faster question retrieval
CREATE INDEX idx_questions_survey_id ON questions(survey_id);

-- Index for faster response queries
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_business_id ON responses(business_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);
CREATE INDEX idx_responses_ai_analyzed ON responses(ai_analyzed);

-- Index for faster answer queries
CREATE INDEX idx_answers_response_id ON answers(response_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Index for faster analysis queries
CREATE INDEX idx_ai_analysis_business_id ON ai_analysis(business_id);
CREATE INDEX idx_ai_analysis_sentiment_label ON ai_analysis(sentiment_label);
CREATE INDEX idx_ai_analysis_analyzed_at ON ai_analysis(analyzed_at);

-- Index for faster insights queries
CREATE INDEX idx_insights_business_id ON insights(business_id);
CREATE INDEX idx_insights_week_dates ON insights(week_start_date, week_end_date);

-- GIN index for JSONB fields (for faster JSON queries)
CREATE INDEX idx_ai_analysis_entities ON ai_analysis USING GIN (entities);
CREATE INDEX idx_insights_top_themes ON insights USING GIN (top_themes);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE businesses IS 'Stores business owner accounts and profile information';
COMMENT ON TABLE surveys IS 'Stores feedback forms with QR codes created by businesses';
COMMENT ON TABLE questions IS 'Stores individual questions that make up each survey';
COMMENT ON TABLE responses IS 'Stores customer feedback submissions';
COMMENT ON TABLE answers IS 'Stores individual answers for each question in a response';
COMMENT ON TABLE ai_analysis IS 'Stores AI-generated sentiment scores and extracted themes';
COMMENT ON TABLE insights IS 'Stores pre-computed weekly analytics for dashboard performance';

COMMENT ON COLUMN surveys.qr_code_url IS 'Stores QR code as base64 string or image URL';
COMMENT ON COLUMN surveys.short_code IS 'Unique code for public URL (e.g., feedlyze.com/s/abc123)';
COMMENT ON COLUMN questions.options IS 'JSON array of options for MCQ questions';
COMMENT ON COLUMN ai_analysis.sentiment_score IS 'Sentiment score from -1.0 (negative) to +1.0 (positive)';
COMMENT ON COLUMN ai_analysis.entities IS 'JSON array of extracted themes with sentiment scores';
COMMENT ON COLUMN insights.top_themes IS 'JSON array of most mentioned themes with counts';
