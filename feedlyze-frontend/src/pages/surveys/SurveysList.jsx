// src/pages/surveys/SurveysList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  QrCode,
  BarChart3,
  Edit3,
  Trash2,
  MoreVertical,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import { Card, Button, Input, Badge, Spinner, Modal, EmptyState } from '../../components/common';
import QRCodeModal from '../../components/surveys/QRCodeModal';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { formatRelativeTime, formatSentimentScore } from '../../utils/helpers';

const SurveysList = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSurvey, setDeletingSurvey] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/surveys');
      const surveysData = response.data.data || {};
      setSurveys(Array.isArray(surveysData) ? surveysData : (surveysData.surveys || []));
    } catch (error) {
      toast.error('Failed to load surveys');
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (survey) => {
    try {
      await api.patch(`/surveys/${survey.id}/toggle`);
      setSurveys(surveys.map(s => 
        s.id === survey.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success(`Survey ${survey.is_active ? 'deactivated' : 'activated'}`);
    } catch (_error) {
      toast.error('Failed to update survey status');
    }
  };

  const handleDeleteSurvey = async () => {
    if (!deletingSurvey) return;
    
    try {
      await api.delete(`/surveys/${deletingSurvey.id}`);
      setSurveys(surveys.filter(s => s.id !== deletingSurvey.id));
      toast.success('Survey deleted successfully');
      setShowDeleteModal(false);
      setDeletingSurvey(null);
    } catch (_error) {
      toast.error('Failed to delete survey');
    }
  };

  const openQRModal = (survey) => {
    setSelectedSurvey(survey);
    setShowQRModal(true);
    setActionMenuOpen(null);
  };

  const openDeleteModal = (survey) => {
    setDeletingSurvey(survey);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  // Filter surveys based on search and status
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' 
      || (filterStatus === 'active' && survey.is_active)
      || (filterStatus === 'inactive' && !survey.is_active);
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-dark-900">My Surveys</h1>
          <p className="text-dark-500 mt-1">
            Manage your feedback surveys and QR codes
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/ai-assistant">
            <Button variant="secondary">
              🤖 AI Assistant
            </Button>
          </Link>
          <Link to="/surveys/create">
            <Button icon={Plus}>Create Survey</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({surveys.length})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Active ({surveys.filter(s => s.is_active).length})
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
          >
            Inactive ({surveys.filter(s => !s.is_active).length})
          </Button>
        </div>
      </div>

      {/* Surveys Grid */}
      {filteredSurveys.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={surveys.length === 0 ? "No surveys yet" : "No surveys match your filters"}
          description={surveys.length === 0 
            ? "Create your first survey to start collecting customer feedback"
            : "Try adjusting your search or filter criteria"
          }
          action={surveys.length === 0 && (
            <Link to="/surveys/create">
              <Button icon={Plus}>Create Your First Survey</Button>
            </Link>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} hover className="relative">
              {/* Action Menu */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setActionMenuOpen(actionMenuOpen === survey.id ? null : survey.id)}
                  className="p-1.5 rounded-lg hover:bg-light-100 text-dark-500"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {actionMenuOpen === survey.id && (
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-light-200 py-2 z-10 min-w-[160px]">
                    <button
                      onClick={() => {
                        navigate(`/surveys/${survey.id}`);
                        setActionMenuOpen(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => openQRModal(survey)}
                      className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-50 flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR Code
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/surveys/${survey.id}/edit`);
                        setActionMenuOpen(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Survey
                    </button>
                    <button
                      onClick={() => handleToggleStatus(survey)}
                      className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-50 flex items-center gap-2"
                    >
                      {survey.is_active ? (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <hr className="my-2 border-light-200" />
                    <button
                      onClick={() => openDeleteModal(survey)}
                      className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Survey Content */}
              <div className="pr-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900">{survey.title}</h3>
                    <p className="text-sm text-dark-500 mt-0.5">
                      {survey.description || 'No description'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-dark-500 mb-3">
                  <span>{survey.response_count || 0} responses</span>
                  <span>•</span>
                  <Badge variant={survey.is_active ? 'success' : 'secondary'} size="sm">
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {survey.avg_rating && (
                    <span className="flex items-center gap-1">
                      <span className="text-warning-500">⭐</span>
                      <span className="text-dark-700">{Number(survey.avg_rating).toFixed(1)}</span>
                    </span>
                  )}
                  {survey.avg_sentiment !== undefined && survey.avg_sentiment !== null && (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4 text-primary-500" />
                      <span className="text-dark-700">
                        {formatSentimentScore(survey.avg_sentiment)}
                      </span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-dark-400 mt-3">
                  Created {formatRelativeTime(survey.created_at)}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-light-200">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={QrCode}
                  onClick={() => openQRModal(survey)}
                  className="flex-1"
                >
                  QR Code
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={BarChart3}
                  onClick={() => navigate(`/analytics?survey=${survey.id}`)}
                  className="flex-1"
                >
                  Analytics
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedSurvey && (
        <QRCodeModal
          survey={selectedSurvey}
          onClose={() => {
            setShowQRModal(false);
            setSelectedSurvey(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingSurvey(null);
        }}
        title="Delete Survey"
      >
        <div className="space-y-4">
          <p className="text-dark-600">
            Are you sure you want to delete <strong>{deletingSurvey?.title}</strong>?
          </p>
          <p className="text-sm text-dark-500">
            This will permanently delete the survey and all {deletingSurvey?.response_count || 0} responses. 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingSurvey(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSurvey}
            >
              Delete Survey
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SurveysList;
