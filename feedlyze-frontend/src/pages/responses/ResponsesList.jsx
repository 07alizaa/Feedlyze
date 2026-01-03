// src/pages/responses/ResponsesList.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  MessageSquare,
  Calendar,
  Smartphone,
  Monitor,
  Tablet,
  ChevronDown,
  Eye,
  Star,
} from 'lucide-react';
import { Card, Button, Input, Badge, Spinner, Select, EmptyState } from '../../components/common';
import api from '../../config/api';
import toast from 'react-hot-toast';
import {
  formatRelativeTime,
  formatSentimentScore,
  getSentimentFromScore,
  truncateText,
} from '../../utils/helpers';

const ResponsesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Filters
  const [selectedSurvey, setSelectedSurvey] = useState(
    searchParams.get('survey') || 'all'
  );
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedResponse, setExpandedResponse] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurvey, selectedSentiment, pagination.page]);

  const fetchSurveys = async () => {
    try {
      const response = await api.get('/surveys');
      setSurveys(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);

      let endpoint = '/responses';
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      if (selectedSurvey !== 'all') {
        endpoint = `/responses/survey/${selectedSurvey}`;
      }

      if (selectedSentiment !== 'all') {
        params.append('sentiment', selectedSentiment);
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);
      setResponses(response.data.data || []);
      if (response.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.loading('Generating export...');
      
      // For now, create a simple CSV from the current responses
      const headers = ['Date', 'Survey', 'Feedback', 'Sentiment Score', 'Sentiment'];
      const rows = responses.map((r) => [
        new Date(r.created_at).toLocaleDateString(),
        r.survey_title || 'N/A',
        `"${(r.feedback_text || '').replace(/"/g, '""')}"`,
        r.sentiment_score || 0,
        getSentimentFromScore(r.sentiment_score || 0).label,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedlyze_responses_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Export downloaded!');
    } catch (_error) {
      toast.dismiss();
      toast.error('Failed to export');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const filteredResponses = responses.filter((response) => {
    if (!searchQuery) return true;
    const text = (response.feedback_text || '').toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Customer Responses</h1>
          <p className="text-dark-500 mt-1">
            View and analyze all feedback from your customers
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          <Select
            value={selectedSurvey}
            onChange={(e) => {
              setSelectedSurvey(e.target.value);
              if (e.target.value !== 'all') {
                setSearchParams({ survey: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            options={[
              { value: 'all', label: 'All Surveys' },
              ...surveys.map((s) => ({ value: String(s.id), label: s.title })),
            ]}
          />
          <Select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            options={[
              { value: 'all', label: 'All Sentiments' },
              { value: 'positive', label: '😊 Positive' },
              { value: 'neutral', label: '😐 Neutral' },
              { value: 'negative', label: '😞 Negative' },
            ]}
          />
        </div>
      </Card>

      {/* Responses List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : filteredResponses.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No responses yet"
          description={
            selectedSurvey !== 'all'
              ? 'This survey hasn\'t received any responses yet. Share the QR code to start collecting feedback!'
              : 'Start collecting feedback by creating and sharing your surveys.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response) => {
            const sentiment = getSentimentFromScore(response.sentiment_score || 0);
            const isExpanded = expandedResponse === response.id;

            return (
              <Card
                key={response.id}
                className={`cursor-pointer transition-all ${
                  isExpanded ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setExpandedResponse(isExpanded ? null : response.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={sentiment.color}>
                        {sentiment.emoji} {sentiment.label}
                      </Badge>
                      <span className="text-sm text-dark-500">
                        {formatSentimentScore(response.sentiment_score || 0)}
                      </span>
                    </div>

                    <p className="text-dark-700">
                      {isExpanded
                        ? response.feedback_text || 'No text feedback provided'
                        : truncateText(
                            response.feedback_text || 'No text feedback provided',
                            150
                          )}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-dark-400 transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-light-200 text-sm text-dark-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatRelativeTime(response.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {getDeviceIcon(response.device_type)}
                    {response.device_type || 'Desktop'}
                  </span>
                  {response.survey_title && (
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      {response.survey_title}
                    </span>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && response.answers && (
                  <div className="mt-4 pt-4 border-t border-light-200">
                    <h4 className="font-semibold text-dark-900 mb-3">
                      Detailed Answers
                    </h4>
                    <div className="space-y-3">
                      {response.answers.map((answer, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-light-50 rounded-lg"
                        >
                          <p className="text-sm text-dark-500 mb-1">
                            {answer.question_text}
                          </p>
                          {answer.question_type === 'rating' ? (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= Number(answer.answer_value)
                                      ? 'text-warning-500 fill-warning-500'
                                      : 'text-light-300'
                                  }`}
                                />
                              ))}
                              <span className="text-dark-600 ml-2">
                                ({answer.answer_value}/5)
                              </span>
                            </div>
                          ) : (
                            <p className="text-dark-700">{answer.answer_value}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Themes */}
                    {response.themes && response.themes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-dark-700 mb-2">
                          Extracted Themes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {response.themes.map((theme, idx) => (
                            <Badge key={idx} variant="secondary">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/responses/${response.id}`);
                        }}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-dark-500">
                Page {pagination.page} of{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={
                  pagination.page >= Math.ceil(pagination.total / pagination.limit)
                }
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsesList;
