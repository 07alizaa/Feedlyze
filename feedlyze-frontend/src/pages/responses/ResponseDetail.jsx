// src/pages/responses/ResponseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  Trash2,
  MessageSquare,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Card, Button, Badge, Spinner, Modal } from '../../components/common';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { formatSentimentScore, getSentimentFromScore } from '../../utils/helpers';

const ResponseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchResponse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/responses/${id}`);
      setResponse(res.data.data);
    } catch (_error) {
      toast.error('Failed to load response');
      navigate('/responses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/responses/${id}`);
      toast.success('Response deleted');
      navigate('/responses');
    } catch (_error) {
      toast.error('Failed to delete response');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!response) {
    return null;
  }

  const sentiment = getSentimentFromScore(response.sentiment_score || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/responses')}
            className="p-2 rounded-lg hover:bg-light-100 text-dark-500 mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dark-900">
              Response #{response.id}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-dark-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(response.created_at).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                {getDeviceIcon(response.device_type)}
                {response.device_type || 'Desktop'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sentiment Analysis */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-dark-900">
                AI Sentiment Analysis
              </h2>
            </div>

            <div className="bg-light-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    sentiment.color === 'success'
                      ? 'bg-success-100'
                      : sentiment.color === 'warning'
                      ? 'bg-warning-100'
                      : 'bg-danger-100'
                  }`}
                >
                  {sentiment.emoji}
                </div>
                <div>
                  <p className="text-sm text-dark-500">Overall Sentiment</p>
                  <p className="text-2xl font-bold text-dark-900">
                    {sentiment.label}
                  </p>
                  <p className="text-dark-600">
                    Score: {formatSentimentScore(response.sentiment_score || 0)}
                  </p>
                </div>
              </div>

              {/* Sentiment Meter */}
              <div className="relative h-4 bg-gradient-to-r from-danger-500 via-warning-500 to-success-500 rounded-full overflow-hidden">
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-6 bg-white border-2 border-dark-900 rounded-full shadow-lg"
                  style={{
                    left: `${((response.sentiment_score || 0) + 1) * 50}%`,
                    marginLeft: '-8px',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-dark-400 mt-1">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>

            {/* Themes */}
            {response.themes && response.themes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-dark-700 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Extracted Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {response.themes.map((theme, idx) => (
                    <Badge key={idx} variant="secondary" size="md">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Answers */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-dark-900">Responses</h2>
            </div>

            <div className="space-y-4">
              {response.answers?.map((answer, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-light-50 rounded-xl border border-light-200"
                >
                  <p className="text-sm text-dark-500 mb-2">
                    Q{idx + 1}: {answer.question_text}
                  </p>
                  {answer.question_type === 'rating' ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= Number(answer.answer_value)
                                ? 'text-warning-500 fill-warning-500'
                                : 'text-light-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-dark-600 font-medium">
                        ({answer.answer_value}/5)
                      </span>
                    </div>
                  ) : (
                    <p className="text-dark-800 font-medium">
                      {answer.answer_value || '-'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Survey Info */}
          <Card>
            <h3 className="font-semibold text-dark-900 mb-3">Survey Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">Survey</span>
                <span className="text-dark-700 font-medium">
                  {response.survey_title || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Submitted</span>
                <span className="text-dark-700">
                  {new Date(response.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Time</span>
                <span className="text-dark-700">
                  {new Date(response.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Device</span>
                <span className="text-dark-700 flex items-center gap-1">
                  {getDeviceIcon(response.device_type)}
                  {response.device_type || 'Desktop'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-dark-900 mb-3">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() =>
                  navigate(`/analytics?survey=${response.survey_id}`)
                }
              >
                View Survey Analytics
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() =>
                  navigate(`/responses?survey=${response.survey_id}`)
                }
              >
                View All Survey Responses
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Response"
      >
        <div className="space-y-4">
          <p className="text-dark-600">
            Are you sure you want to delete this response? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Response
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResponseDetail;
