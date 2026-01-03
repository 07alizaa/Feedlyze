// src/pages/surveys/SurveyDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  QrCode,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Clock,
  ToggleLeft,
  ToggleRight,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Card, Button, Badge, Spinner } from '../../components/common';
import { QRCodeModal } from '../../components/surveys';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { formatRelativeTime, formatSentimentScore, getSentimentFromScore } from '../../utils/helpers';

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [recentResponses, setRecentResponses] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchSurveyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSurveyDetails = async () => {
    try {
      setLoading(true);
      const [surveyRes, responsesRes] = await Promise.all([
        api.get(`/surveys/${id}`),
        api.get(`/responses/survey/${id}?limit=5`).catch(() => ({ data: { data: [] } })),
      ]);

      setSurvey(surveyRes.data.data);
      setRecentResponses(responsesRes.data.data || []);
    } catch (_error) {
      toast.error('Failed to load survey');
      navigate('/surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/surveys/${id}/toggle`);
      setSurvey({ ...survey, is_active: !survey.is_active });
      toast.success(`Survey ${survey.is_active ? 'deactivated' : 'activated'}`);
    } catch (_error) {
      toast.error('Failed to update survey status');
    }
  };

  const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const publicUrl = survey ? `${baseUrl}/s/${survey.short_code}` : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/surveys')}
            className="p-2 rounded-lg hover:bg-light-100 text-dark-500 mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-900">{survey.title}</h1>
              <Badge variant={survey.is_active ? 'success' : 'secondary'}>
                {survey.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {survey.description && (
              <p className="text-dark-500 mt-1">{survey.description}</p>
            )}
            <p className="text-sm text-dark-400 mt-2">
              Created {formatRelativeTime(survey.created_at)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={survey.is_active ? ToggleLeft : ToggleRight}
            onClick={handleToggleStatus}
          >
            {survey.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="secondary"
            icon={QrCode}
            onClick={() => setShowQRModal(true)}
          >
            QR Code
          </Button>
          <Button
            icon={Edit3}
            onClick={() => navigate(`/surveys/${id}/edit`)}
          >
            Edit Survey
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Responses</p>
              <p className="text-2xl font-bold text-dark-900">
                {survey.response_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Star className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Avg Rating</p>
              <p className="text-2xl font-bold text-dark-900">
                {survey.avg_rating ? Number(survey.avg_rating).toFixed(1) : '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Avg Sentiment</p>
              <p className="text-2xl font-bold text-dark-900">
                {survey.avg_sentiment !== null && survey.avg_sentiment !== undefined
                  ? formatSentimentScore(survey.avg_sentiment)
                  : '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-light-200 rounded-xl">
              <Clock className="w-5 h-5 text-dark-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Questions</p>
              <p className="text-2xl font-bold text-dark-900">
                {survey.questions?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">
              Survey Questions
            </h2>
            <div className="space-y-3">
              {survey.questions?.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 bg-light-50 rounded-xl border border-light-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-dark-800 font-medium">
                        {question.question_text}
                        {question.is_required && (
                          <span className="text-danger-500 ml-1">*</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" size="sm">
                          {question.question_type === 'rating' && '⭐ Rating'}
                          {question.question_type === 'text' && '📝 Text'}
                          {question.question_type === 'mcq' && '📋 Multiple Choice'}
                        </Badge>
                      </div>
                      {question.question_type === 'mcq' && question.options && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {question.options.map((opt, i) => (
                            <span key={i} className="text-sm text-dark-500 bg-white px-2 py-1 rounded">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Link */}
          <Card>
            <h3 className="font-semibold text-dark-900 mb-3">Public Survey Link</h3>
            <div className="p-3 bg-light-50 rounded-lg mb-3">
              <p className="text-sm text-dark-600 break-all">{publicUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success('Link copied!');
                }}
              >
                Copy Link
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                onClick={() => window.open(publicUrl, '_blank')}
              >
                Open
              </Button>
            </div>
          </Card>

          {/* Recent Responses */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-900">Recent Responses</h3>
              <Link
                to={`/responses?survey=${id}`}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                View all →
              </Link>
            </div>

            {recentResponses.length === 0 ? (
              <p className="text-center text-dark-400 py-4">
                No responses yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentResponses.map((response) => {
                  const sentiment = getSentimentFromScore(response.sentiment_score || 0);
                  return (
                    <div
                      key={response.id}
                      className="p-3 bg-light-50 rounded-lg"
                    >
                      <p className="text-sm text-dark-600 line-clamp-2">
                        {response.feedback_text || 'Rating only'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={sentiment.color} size="sm">
                          {sentiment.emoji}
                        </Badge>
                        <span className="text-xs text-dark-400">
                          {formatRelativeTime(response.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="font-semibold text-dark-900 mb-3">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                icon={BarChart3}
                className="w-full justify-start"
                onClick={() => navigate(`/analytics?survey=${id}`)}
              >
                View Analytics
              </Button>
              <Button
                variant="secondary"
                icon={MessageSquare}
                className="w-full justify-start"
                onClick={() => navigate(`/responses?survey=${id}`)}
              >
                View All Responses
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <QRCodeModal
          survey={survey}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

export default SurveyDetail;
