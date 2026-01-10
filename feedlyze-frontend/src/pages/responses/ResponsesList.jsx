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
  const [surveysLoaded, setSurveysLoaded] = useState(false);
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
    // Only fetch responses after surveys have been loaded
    if (!surveysLoaded) return;
    if (surveys.length === 0) {
      setLoading(false);
      return;
    }
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurvey, selectedSentiment, pagination.page, surveysLoaded]);

  const fetchSurveys = async () => {
    try {
      const response = await api.get('/surveys');
      const data = response.data.data || {};
      // Handle both array and object formats
      const surveysArray = Array.isArray(data) ? data : (data.surveys || []);
      setSurveys(surveysArray);
      setSurveysLoaded(true);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      setSurveys([]);
      setSurveysLoaded(true);
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);

      // If "all" is selected, fetch from all surveys and combine
      if (selectedSurvey === 'all') {
        const allResponses = [];
        // Fetch responses from each survey
        for (const survey of surveys) {
          try {
            const response = await api.get(`/responses/survey/${survey.id}?page=1&pageSize=100`);
            const data = response.data.data || {};
            const surveyResponses = Array.isArray(data) ? data : (data.responses || []);
            // Add survey title to each response
            surveyResponses.forEach(r => {
              r.survey_title = survey.title;
            });
            allResponses.push(...surveyResponses);
          } catch (err) {
            console.error(`Failed to fetch responses for survey ${survey.id}:`, err);
          }
        }
        // Sort by submitted_at descending
        allResponses.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        setResponses(allResponses);
        setPagination(prev => ({ ...prev, total: allResponses.length }));
      } else {
        // Fetch responses for specific survey
        const params = new URLSearchParams();
        params.append('page', pagination.page);
        params.append('pageSize', pagination.limit);

        if (selectedSentiment !== 'all') {
          params.append('sentiment', selectedSentiment);
        }

        const response = await api.get(`/responses/survey/${selectedSurvey}?${params.toString()}`);
        const data = response.data.data || {};
        const responsesArray = Array.isArray(data) ? data : (data.responses || []);
        setResponses(responsesArray);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total || 0,
          }));
        }
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
        new Date(r.submitted_at).toLocaleDateString(),
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

  // Only include responses with answers and answers.length > 0
  const validResponses = responses.filter(r => Array.isArray(r.answers) && r.answers.length > 0);
  const filteredResponses = validResponses.filter((response) => {
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
      ) : surveys.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No surveys found"
          description="Create a survey to start collecting responses."
        />
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
            // Only show sentiment if AI analysis exists and is complete (sentiment_score is a number)
            const showSentiment = typeof response.sentiment_score === 'number' && !isNaN(response.sentiment_score);
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
                      {showSentiment && (
                        <Badge variant={getSentimentFromScore(response.sentiment_score).color}>
                          {getSentimentFromScore(response.sentiment_score).emoji} {getSentimentFromScore(response.sentiment_score).label}
                        </Badge>
                      )}
                      {showSentiment && (
                        <span className="text-sm text-dark-500">
                          {formatSentimentScore(response.sentiment_score)}
                        </span>
                      )}
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
                    {formatRelativeTime(response.submitted_at)}
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
                          {answer.answer_type === 'rating' ? (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= Number(answer.answer_rating)
                                      ? 'text-warning-500 fill-warning-500'
                                      : 'text-light-300'
                                  }`}
                                />
                              ))}
                              <span className="text-dark-600 ml-2">
                                ({answer.answer_rating}/5)
                              </span>
                            </div>
                          ) : (
                            <p className="text-dark-700">{answer.answer_text || answer.answer_choice}</p>
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
