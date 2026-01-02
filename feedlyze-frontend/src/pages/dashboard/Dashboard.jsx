// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, Badge, Button, Spinner } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { formatRelativeTime, getSentimentFromScore, formatSentimentScore, truncateText } from '../../utils/helpers';

// Metric Card Component
const MetricCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-dark-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === 'increase' ? (
                <ArrowUpRight className="w-4 h-4 text-success-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-danger-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {change}
              </span>
              <span className="text-sm text-dark-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgSentiment: 0,
  });
  const [recentResponses, setRecentResponses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview stats
      const [overviewRes, surveysRes] = await Promise.all([
        api.get('/insights/overview').catch(() => ({ data: { data: {} } })),
        api.get('/surveys').catch(() => ({ data: { data: [] } })),
      ]);

      const overview = overviewRes.data.data || {};
      const surveys = surveysRes.data.data || [];

      setStats({
        totalSurveys: surveys.length,
        activeSurveys: surveys.filter(s => s.is_active).length,
        totalResponses: overview.totalResponses || 0,
        avgSentiment: overview.avgSentiment || 0,
      });

      // Get recent responses from the latest survey
      if (surveys.length > 0) {
        try {
          const responsesRes = await api.get(`/responses/survey/${surveys[0].id}?limit=5`);
          setRecentResponses(responsesRes.data.data || []);
        } catch (_e) {
          setRecentResponses([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">
            Welcome back, {user?.business_name || 'User'}! 👋
          </h1>
          <p className="text-dark-500 mt-1">
            Here's what's happening with your feedback today.
          </p>
        </div>
        <Link to="/surveys/create">
          <Button icon={Plus}>Create Survey</Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Surveys"
          value={stats.totalSurveys}
          icon={ClipboardList}
          color="primary"
        />
        <MetricCard
          title="Active Surveys"
          value={stats.activeSurveys}
          icon={ClipboardList}
          color="success"
        />
        <MetricCard
          title="Total Responses"
          value={stats.totalResponses}
          change="+12%"
          changeType="increase"
          icon={MessageSquare}
          color="warning"
        />
        <MetricCard
          title="Avg Sentiment"
          value={formatSentimentScore(stats.avgSentiment)}
          icon={TrendingUp}
          color={stats.avgSentiment >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Responses */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="p-4 border-b border-light-200 flex items-center justify-between">
              <h2 className="font-semibold text-dark-900">Recent Responses</h2>
              <Link to="/responses" className="text-sm text-primary-500 hover:text-primary-600">
                View all →
              </Link>
            </div>
            
            {recentResponses.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-dark-300 mx-auto mb-3" />
                <p className="text-dark-500">No responses yet</p>
                <p className="text-sm text-dark-400 mt-1">
                  Share your survey to start collecting feedback
                </p>
              </div>
            ) : (
              <div className="divide-y divide-light-200">
                {recentResponses.map((response) => {
                  const sentiment = getSentimentFromScore(response.sentiment_score || 0);
                  return (
                    <div key={response.id} className="p-4 hover:bg-light-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-dark-700">
                            {truncateText(response.feedback_text || 'No text feedback', 120)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-dark-400">
                              {formatRelativeTime(response.created_at)}
                            </span>
                            <Badge variant={sentiment.color} size="sm">
                              {sentiment.emoji} {sentiment.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-dark-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/surveys/create"
                className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-dark-900">Create Survey</p>
                  <p className="text-xs text-dark-500">Start collecting feedback</p>
                </div>
              </Link>
              
              <Link
                to="/analytics"
                className="flex items-center gap-3 p-3 bg-light-50 rounded-lg hover:bg-light-100 transition-colors"
              >
                <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-dark-900">View Analytics</p>
                  <p className="text-xs text-dark-500">Insights & trends</p>
                </div>
              </Link>
            </div>
          </Card>

          {/* Sentiment Overview */}
          <Card>
            <h2 className="font-semibold text-dark-900 mb-4">Sentiment Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Positive</span>
                <span className="text-sm font-medium text-success-600">68%</span>
              </div>
              <div className="w-full bg-light-200 rounded-full h-2">
                <div className="bg-success-500 h-2 rounded-full" style={{ width: '68%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Neutral</span>
                <span className="text-sm font-medium text-warning-600">22%</span>
              </div>
              <div className="w-full bg-light-200 rounded-full h-2">
                <div className="bg-warning-500 h-2 rounded-full" style={{ width: '22%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Negative</span>
                <span className="text-sm font-medium text-danger-600">10%</span>
              </div>
              <div className="w-full bg-light-200 rounded-full h-2">
                <div className="bg-danger-500 h-2 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
