// src/pages/analytics/Analytics.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  MessageSquare,
  Star,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Tag,
  Lightbulb,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, Button, Badge, Spinner, Select } from '../../components/common';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { formatSentimentScore, getSentimentFromScore } from '../../utils/helpers';

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444',
};

const Analytics = () => {
  const [searchParams] = useSearchParams();
  const surveyIdParam = searchParams.get('survey');

  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(surveyIdParam || 'all');
  const [dateRange, setDateRange] = useState('30');
  const [overview, setOverview] = useState(null);
  const [weeklyInsights, setWeeklyInsights] = useState(null);
  const [sentimentTrend, setSentimentTrend] = useState([]);
  const [sentimentDistribution, setSentimentDistribution] = useState([]);
  const [topThemes, setTopThemes] = useState([]);
  const [analysisReady, setAnalysisReady] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurvey, dateRange]);

  const fetchSurveys = async () => {
    try {
      const response = await api.get('/surveys');
      setSurveys(response.data.data?.surveys || []);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('days', dateRange);
      if (selectedSurvey !== 'all') {
        params.append('survey_id', selectedSurvey);
      }

      const [overviewRes, insightsRes] = await Promise.all([
        api.get(`/insights/overview?${params.toString()}`).catch(() => ({ data: { data: {} } })),
        api.get(`/insights/weekly?${params.toString()}`).catch(() => ({ data: { data: {} } })),
      ]);

      const overviewData = overviewRes.data.data || {};
      const insightsData = insightsRes.data.data || {};

      // Filter all insights/analytics to only valid, analyzed responses
      // For trend: only days with at least one valid, analyzed response
      const validTrend = (insightsData.insights || []).filter(stat => {
        // stat.responses: array of responses for the day
        if (!Array.isArray(stat.responses)) return false;
        // Only count responses with answers and answers.length > 0 and sentiment_score is a number
        const validResponses = stat.responses.filter(r => Array.isArray(r.answers) && r.answers.length > 0 && typeof r.sentiment_score === 'number' && !isNaN(r.sentiment_score));
        return validResponses.length > 0;
      });

      // For distribution: only count valid, analyzed responses
      const allResponses = (insightsData.allResponses || []).filter(r => Array.isArray(r.answers) && r.answers.length > 0 && typeof r.sentiment_score === 'number' && !isNaN(r.sentiment_score));

      // For themes: only themes with valid, analyzed responses
      const validThemes = (insightsData.topThemes || []).filter(theme => typeof theme.avgSentiment === 'number' && !isNaN(theme.avgSentiment) && theme.count > 0);

      // For weekly insights: only show if at least one valid, analyzed response exists
      const hasValidAnalyzed = allResponses.length > 0;

      // Compute new overview based on valid, analyzed responses
      const newOverview = {
        totalResponses: allResponses.length,
        avgSentiment: hasValidAnalyzed ? (allResponses.reduce((sum, r) => sum + r.sentiment_score, 0) / allResponses.length) : null,
        avgRating: hasValidAnalyzed ? (allResponses.reduce((sum, r) => sum + (typeof r.avg_rating === 'number' ? r.avg_rating : 0), 0) / allResponses.length) : null,
        positiveCount: allResponses.filter(r => r.sentiment_score > 0.2).length,
        neutralCount: allResponses.filter(r => r.sentiment_score >= -0.2 && r.sentiment_score <= 0.2).length,
        negativeCount: allResponses.filter(r => r.sentiment_score < -0.2).length,
      };

      setOverview(newOverview);
      setWeeklyInsights(hasValidAnalyzed ? insightsData : {});

      // Determine if analysis is ready: must have at least one valid, analyzed response
      setAnalysisReady(hasValidAnalyzed);

      // Only set trend/distribution/themes if analysis is ready
      if (hasValidAnalyzed) {
        // Generate sentiment trend data (use validTrend)
        const trendData = validTrend.map((stat) => ({
          date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sentiment: parseFloat(stat.avgSentiment || 0),
          responses: stat.responses.filter(r => Array.isArray(r.answers) && r.answers.length > 0 && typeof r.sentiment_score === 'number' && !isNaN(r.sentiment_score)).length,
        }));
        setSentimentTrend(trendData);
        // Generate sentiment distribution
        const distribution = [
          { name: 'Positive', value: newOverview.positiveCount, color: SENTIMENT_COLORS.positive },
          { name: 'Neutral', value: newOverview.neutralCount, color: SENTIMENT_COLORS.neutral },
          { name: 'Negative', value: newOverview.negativeCount, color: SENTIMENT_COLORS.negative },
        ];
        setSentimentDistribution(distribution);
        setTopThemes(validThemes);
      } else {
        setSentimentTrend([]);
        setSentimentDistribution([]);
        setTopThemes([]);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSentimentTrend = (dailyStats) => {
    if (!dailyStats || dailyStats.length === 0) {
      return [];
    }
    return dailyStats.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sentiment: parseFloat(stat.avgSentiment || 0), // keep as number for recharts
      responses: stat.count || 0,
    }));
  };

  const handleExportReport = () => {
    toast.success('Report export coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalResponses = overview?.totalResponses || 0;
  const avgSentiment = (typeof overview?.avgSentiment === 'number' && !isNaN(overview?.avgSentiment)) ? overview.avgSentiment : null;
  const avgRating = (typeof overview?.avgRating === 'number' && !isNaN(overview?.avgRating)) ? overview.avgRating : null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Analytics & Insights</h1>
          <p className="text-dark-500 mt-1">
            Understand your customer feedback at a glance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchAnalytics}>
            Refresh
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportReport}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Sentiment Score Explanation */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-dark-800 mb-2">What is Sentiment Score?</h2>
          <p className="text-dark-600 mb-2">
            The sentiment score measures the overall emotion of your customers' feedback, ranging from <span className="font-semibold text-success-700">+1 (very positive)</span> to <span className="font-semibold text-danger-700">-1 (very negative)</span>. A score near <span className="font-semibold text-warning-700">0</span> means neutral feedback.
          </p>
          <ul className="list-disc pl-6 text-dark-500 text-sm mb-2">
            <li><span className="font-semibold text-success-700">Positive</span> (closer to +1): Customers are happy and satisfied.</li>
            <li><span className="font-semibold text-danger-700">Negative</span> (closer to -1): Customers are unhappy or dissatisfied.</li>
            <li><span className="font-semibold text-warning-700">Neutral</span> (around 0): Feedback is mixed or neither positive nor negative.</li>
          </ul>
          <p className="text-dark-500 text-sm">
            Use the sentiment trend and distribution charts below to quickly spot changes in customer mood, track improvements, and identify areas needing attention for each survey.
          </p>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedSurvey}
            onChange={(e) => setSelectedSurvey(e.target.value)}
            options={[
              { value: 'all', label: 'All Surveys' },
              ...surveys.map((s) => ({ value: String(s.id), label: s.title })),
            ]}
          />
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '7', label: 'Last 7 Days' },
              { value: '30', label: 'Last 30 Days' },
              { value: '90', label: 'Last 90 Days' },
            ]}
          />
        </div>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Responses</p>
              <p className="text-2xl font-bold text-dark-900">{totalResponses}</p>
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
                {analysisReady ? formatSentimentScore(avgSentiment) : (totalResponses > 0 ? 'Analysis not ready' : '-')}
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
                {avgRating !== null ? Number(avgRating).toFixed(1) : (totalResponses > 0 ? 'Analysis not ready' : '-')}/5
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-light-200 rounded-xl">
              <Tag className="w-5 h-5 text-dark-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Top Theme</p>
              <p className="text-2xl font-bold text-dark-900">
                {analysisReady && topThemes[0]?.theme ? topThemes[0].theme : (totalResponses > 0 ? 'Analysis not ready' : '-')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Trend Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Sentiment Trend
              </h2>
            </div>
            <div className="w-full" style={{ minHeight: 300, minWidth: 0 }}>
              {!analysisReady ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BarChart3 className="w-12 h-12 text-light-300 mb-3" />
                  <p className="text-dark-500 font-medium">
                    {totalResponses === 0
                      ? 'No responses yet'
                      : 'Analysis not ready. Sentiment trend will appear once analysis is complete.'}
                  </p>
                </div>
              ) : sentimentTrend.length > 0 ? (
                <ResponsiveContainer width="100%" aspect={2} minWidth={0} minHeight={0}>
                  <LineChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[-1, 1]}
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value, name) =>
                        name === 'sentiment' ? [`${value >= 0 ? '+' : ''}${value.toFixed(2)}`, 'Sentiment'] : [value, name]
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="sentiment"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    {/* Reference line at zero */}
                    <Line
                      type="linear"
                      dataKey={() => 0}
                      stroke="#9CA3AF"
                      strokeWidth={1}
                      dot={false}
                      isAnimationActive={false}
                      legendType="none"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BarChart3 className="w-12 h-12 text-light-300 mb-3" />
                  <p className="text-dark-500 font-medium">No trend data available yet</p>
                  <p className="text-sm text-dark-400 mt-1">Collecting more responses will generate trends.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sentiment Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-500" />
              Sentiment Distribution
            </h2>
          </div>
          {!analysisReady ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <PieChart className="w-12 h-12 text-light-300 mb-3" />
              <p className="text-dark-500 font-medium">
                {totalResponses === 0
                  ? 'No responses yet'
                  : 'Analysis not ready. Sentiment distribution will appear once analysis is complete.'}
              </p>
            </div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {sentimentDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-dark-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Top Themes & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Themes */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-500" />
              Top Themes
            </h2>
          </div>
          {!analysisReady ? (
            <p className="text-center text-dark-400 py-8">
              {totalResponses === 0
                ? 'No responses yet'
                : 'Analysis not ready. Top themes will appear once analysis is complete.'}
            </p>
          ) : topThemes.length === 0 ? (
            <p className="text-center text-dark-400 py-8">
              No themes extracted yet. Collect more responses to see themes.
            </p>
          ) : (
            <div className="space-y-3">
              {topThemes.slice(0, 6).map((theme, idx) => {
                const sentiment = getSentimentFromScore(theme.avgSentiment || 0);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-light-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-dark-800">
                        {theme.theme}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-dark-500">
                        {theme.count} mentions
                      </span>
                      <Badge variant={sentiment.color} size="sm">
                        {formatSentimentScore(theme.avgSentiment || 0)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Weekly Insights */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning-500" />
              AI Insights
            </h2>
          </div>
          {!analysisReady ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Lightbulb className="w-12 h-12 text-light-300 mb-3" />
              <p className="text-dark-500 font-medium">
                {totalResponses === 0
                  ? 'No responses yet'
                  : 'Analysis not ready. AI insights will appear once analysis is complete.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Positive Highlights */}
              {weeklyInsights?.positiveHighlights?.length > 0 && (
                <div className="p-4 bg-success-50 rounded-xl border border-success-200">
                  <h3 className="font-medium text-success-700 mb-2 flex items-center gap-2">
                    <ArrowUp className="w-4 h-4" />
                    Positive Highlights
                  </h3>
                  <ul className="text-sm text-success-700 space-y-1">
                    {weeklyInsights.positiveHighlights.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {weeklyInsights?.improvementAreas?.length > 0 && (
                <div className="p-4 bg-warning-50 rounded-xl border border-warning-200">
                  <h3 className="font-medium text-warning-700 mb-2 flex items-center gap-2">
                    <ArrowDown className="w-4 h-4" />
                    Areas for Improvement
                  </h3>
                  <ul className="text-sm text-warning-700 space-y-1">
                    {weeklyInsights.improvementAreas.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Recommendation */}
              {weeklyInsights?.recommendation && (
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <h3 className="font-medium text-primary-700 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI Recommendation
                  </h3>
                  <p className="text-sm text-primary-700">
                    {weeklyInsights.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Survey Comparison Table */}
      {surveys.length > 1 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900">
              Survey Comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">
                    Survey Name
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-500">
                    Responses
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-500">
                    Avg Rating
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-500">
                    Avg Sentiment
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr
                    key={survey.id}
                    className="border-b border-light-100 hover:bg-light-50"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-dark-800">
                        {survey.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-dark-600">
                      {survey.response_count || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                        {survey.avg_rating
                          ? Number(survey.avg_rating).toFixed(1)
                          : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {survey.avg_sentiment !== null &&
                        survey.avg_sentiment !== undefined
                        ? formatSentimentScore(survey.avg_sentiment)
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={survey.is_active ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {survey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
