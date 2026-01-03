// src/pages/surveys/PublicSurvey.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { Button, Spinner } from '../../components/common';
import api from '../../config/api';
import confetti from 'canvas-confetti';

const PublicSurvey = () => {
  const { shortCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchSurvey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortCode]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/surveys/public/${shortCode}`);
      setSurvey(response.data.data);
      
      // Initialize answers
      const initialAnswers = {};
      response.data.data.questions?.forEach((q) => {
        initialAnswers[q.id] = q.question_type === 'rating' ? 0 : '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching survey:', error);
      if (error.response?.status === 404) {
        setError('Survey not found');
      } else if (error.response?.data?.error?.includes('inactive')) {
        setError('This survey is no longer accepting responses');
      } else {
        setError('Failed to load survey');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId, rating) => {
    setAnswers({ ...answers, [questionId]: rating });
    if (validationErrors[questionId]) {
      setValidationErrors({ ...validationErrors, [questionId]: null });
    }
  };

  const handleTextChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    if (validationErrors[questionId]) {
      setValidationErrors({ ...validationErrors, [questionId]: null });
    }
  };

  const handleMCQChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    if (validationErrors[questionId]) {
      setValidationErrors({ ...validationErrors, [questionId]: null });
    }
  };

  const validate = () => {
    const errors = {};
    
    survey.questions?.forEach((question) => {
      if (question.is_required) {
        const answer = answers[question.id];
        if (question.question_type === 'rating' && (!answer || answer === 0)) {
          errors[question.id] = 'Please select a rating';
        } else if (question.question_type === 'text' && (!answer || !answer.trim())) {
          errors[question.id] = 'This field is required';
        } else if (question.question_type === 'mcq' && !answer) {
          errors[question.id] = 'Please select an option';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-field');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);

      // Format answers for API
      const formattedAnswers = survey.questions?.map((question) => ({
        question_id: question.id,
        answer_value: question.question_type === 'rating' 
          ? String(answers[question.id]) 
          : answers[question.id],
      }));

      await api.post('/responses/submit', {
        survey_id: survey.id,
        answers: formattedAnswers,
        device_type: getDeviceType(),
      });

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  };

  const handleSubmitAnother = () => {
    // Reset form
    const initialAnswers = {};
    survey.questions?.forEach((q) => {
      initialAnswers[q.id] = q.question_type === 'rating' ? 0 : '';
    });
    setAnswers(initialAnswers);
    setSubmitted(false);
    setValidationErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-light-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-light-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-danger-500" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Oops!</h1>
          <p className="text-dark-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-light-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-500" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Thank You! 🎉</h1>
          <p className="text-dark-500 mb-6">
            Your feedback has been submitted successfully. We appreciate your time!
          </p>
          <Button variant="secondary" onClick={handleSubmitAnother}>
            Submit Another Response
          </Button>
        </div>
        
        {/* Powered by Feedlyze */}
        <div className="fixed bottom-4 left-0 right-0 text-center">
          <p className="text-sm text-dark-400">
            Powered by <span className="font-semibold text-primary-500">Feedlyze</span> 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-light-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Survey Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h1 className="text-2xl font-bold text-dark-900">{survey.title}</h1>
          {survey.description && (
            <p className="text-dark-500 mt-2">{survey.description}</p>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {survey.questions?.map((question, index) => (
            <div
              key={question.id}
              className={`bg-white rounded-2xl shadow-lg p-6 ${
                validationErrors[question.id] ? 'error-field ring-2 ring-danger-500' : ''
              }`}
            >
              <p className="font-medium text-dark-800 mb-4">
                {index + 1}. {question.question_text}
                {question.is_required && (
                  <span className="text-danger-500 ml-1">*</span>
                )}
              </p>

              {/* Rating Question */}
              {question.question_type === 'rating' && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(question.id, rating)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl transition-all ${
                        answers[question.id] >= rating
                          ? 'bg-warning-100'
                          : 'bg-light-100 hover:bg-light-200'
                      }`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          answers[question.id] >= rating
                            ? 'text-warning-500 fill-warning-500'
                            : 'text-light-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Text Question */}
              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  placeholder={question.placeholder || 'Share your thoughts...'}
                  rows={4}
                  className="w-full p-4 border border-light-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              )}

              {/* MCQ Question */}
              {question.question_type === 'mcq' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        answers[question.id] === option
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'bg-light-50 border-2 border-transparent hover:bg-light-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          answers[question.id] === option
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-light-400'
                        }`}
                      >
                        {answers[question.id] === option && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-dark-700">{option}</span>
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleMCQChange(question.id, option)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Error Message */}
              {validationErrors[question.id] && (
                <p className="text-sm text-danger-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors[question.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            loading={submitting}
            icon={Send}
            className="w-full py-4 text-lg"
          >
            Submit Feedback
          </Button>
        </div>

        {/* Powered by Feedlyze */}
        <div className="text-center mt-8">
          <p className="text-sm text-dark-400">
            Powered by <span className="font-semibold text-primary-500">Feedlyze</span> 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicSurvey;
