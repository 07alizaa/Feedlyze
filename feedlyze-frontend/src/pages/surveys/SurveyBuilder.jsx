// src/pages/surveys/SurveyBuilder.jsx
// A fully functional drag-and-drop survey builder for non-technical users
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Save,
  Eye,
  Star,
  AlignLeft,
  ListChecks,
  GripVertical,
  Trash2,
  Copy,
  Plus,
  Check,
  X,
  Move,
} from 'lucide-react';
import { Button, Input, Textarea, Spinner } from '../../components/common';
import api from '../../config/api';
import toast from 'react-hot-toast';

// ============================================================
// QUESTION TYPES CONFIGURATION
// ============================================================
const QUESTION_TYPES = [
  {
    type: 'rating',
    label: 'Star Rating',
    description: 'Let customers rate 1 to 5 stars',
    icon: Star,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
  },
  {
    type: 'text',
    label: 'Text Answer',
    description: 'Get written feedback',
    icon: AlignLeft,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
  },
  {
    type: 'mcq',
    label: 'Multiple Choice',
    description: 'Choose from options',
    icon: ListChecks,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
  },
];

// Generate unique ID for questions
const generateId = () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================================
// DRAGGABLE QUESTION TYPE (Left Panel)
// ============================================================
const DraggableQuestionType = ({ type }) => {
  const Icon = type.icon;
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type.type}`,
    data: { type: 'new-question', questionType: type.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-full p-4 rounded-xl border-2 ${type.borderColor} ${type.bgColor} ${type.hoverBorder} 
        hover:shadow-md transition-all duration-200 text-left group cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-95 shadow-xl ring-2 ring-primary-400' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm 
          group-hover:scale-105 transition-transform">
          <Icon className={`w-6 h-6 ${type.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-base">{type.label}</p>
          <p className="text-sm text-gray-500">{type.description}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Move className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DROPPABLE WORKSPACE AREA
// ============================================================
const DroppableWorkspace = ({ children, isOver, isEmpty }) => {
  const { setNodeRef } = useDroppable({
    id: 'workspace',
  });

  return (
    <div
      ref={setNodeRef}
      id="survey-workspace"
      className={`flex-1 overflow-y-auto p-4 transition-all duration-300 min-h-[300px]
        ${isOver ? 'bg-primary-50 ring-4 ring-primary-200 ring-inset' : ''}
        ${isEmpty && !isOver ? 'flex items-center justify-center' : ''}`}
    >
      {/* Drop indicator when dragging over */}
      {isOver && isEmpty && (
        <div className="flex flex-col items-center justify-center py-12 pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4 animate-pulse">
            <Plus className="w-12 h-12 text-primary-500" />
          </div>
          <p className="text-lg font-semibold text-primary-600">Drop here to add question</p>
        </div>
      )}
      {!isOver && isEmpty && <EmptyStateWithDragHint />}
      {!isEmpty && children}
    </div>
  );
};

// ============================================================
// EMPTY STATE WITH DRAG HINT
// ============================================================
const EmptyStateWithDragHint = () => (
  <div className="flex flex-col items-center justify-center text-center py-12">
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <Move className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Drag questions here</h3>
    <p className="text-gray-500 max-w-xs">
      Drag a question type from the left panel and drop it here to start building your survey
    </p>
    <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
        <Star className="w-4 h-4 text-amber-500" />
      </div>
      <span>←</span>
      <span>Drag from left panel</span>
    </div>
  </div>
);

// ============================================================
// SORTABLE QUESTION CARD WITH INLINE EDITING
// ============================================================
const SortableQuestionCard = ({ 
  question, 
  index, 
  isSelected,
  onSelect,
  onUpdate, 
  onDelete, 
  onDuplicate 
}) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(question.question_text);
  const inputRef = useRef(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = QUESTION_TYPES.find(t => t.type === question.question_type) || QUESTION_TYPES[1];
  const Icon = typeConfig.icon;

  // Handle inline text edit
  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditingText(true);
    setEditText(question.question_text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveText = () => {
    onUpdate({ ...question, question_text: editText });
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditText(question.question_text);
    setIsEditingText(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveText();
    if (e.key === 'Escape') handleCancelEdit();
  };

  // Handle option changes
  const handleOptionChange = (optIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onUpdate({ ...question, options: newOptions });
  };

  const handleRemoveOption = (optIndex) => {
    if ((question.options?.length || 0) <= 2) return;
    const newOptions = question.options.filter((_, i) => i !== optIndex);
    onUpdate({ ...question, options: newOptions });
  };

  const handleToggleRequired = () => {
    onUpdate({ ...question, is_required: !question.is_required });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(question)}
      className={`bg-white rounded-xl border-2 transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 shadow-2xl scale-[1.02] border-primary-400' 
          : isSelected
            ? 'border-primary-500 shadow-lg ring-4 ring-primary-100'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start gap-3 p-4 border-b border-gray-100">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing p-2 -m-2 rounded-lg 
            hover:bg-gray-100 transition-colors touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Question Number */}
        <div className={`w-8 h-8 rounded-full ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-sm font-bold ${typeConfig.iconColor}`}>{index + 1}</span>
        </div>

        {/* Question Type Icon */}
        <div className={`w-8 h-8 rounded-lg ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${typeConfig.iconColor}`} />
        </div>

        {/* Question Text - Editable */}
        <div className="flex-1 min-w-0">
          {isEditingText ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveText}
                className="flex-1 px-3 py-1.5 border-2 border-primary-400 rounded-lg text-base 
                  focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Type your question..."
                onClick={(e) => e.stopPropagation()}
              />
              <button onClick={handleSaveText} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancelEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={handleStartEdit}
              className="cursor-text group/text"
            >
              <p className={`text-base font-medium ${question.question_text ? 'text-gray-800' : 'text-gray-400 italic'} 
                group-hover/text:text-primary-600 transition-colors`}>
                {question.question_text || 'Click to add your question...'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{typeConfig.label}</p>
            </div>
          )}
        </div>

        {/* Required Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleRequired(); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            question.is_required 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {question.is_required ? 'Required' : 'Optional'}
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(question); }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(question); }}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Body - Type-specific content */}
      <div className="p-4">
        {/* Rating Preview */}
        {question.question_type === 'rating' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-gray-300" />
              </div>
            ))}
            <span className="text-sm text-gray-400 self-center ml-2">1-5 stars</span>
          </div>
        )}

        {/* Text Input Preview */}
        {question.question_type === 'text' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-400">Customers will type their answer here...</p>
          </div>
        )}

        {/* Multiple Choice Options - Editable */}
        {question.question_type === 'mcq' && (
          <div className="space-y-2">
            {(question.options || ['Option 1', 'Option 2']).map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-3 group/opt">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-transparent rounded-lg 
                    focus:bg-white focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100
                    transition-all text-sm"
                  placeholder={`Option ${optIdx + 1}`}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveOption(optIdx); }}
                  disabled={(question.options?.length || 0) <= 2}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 
                    disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover/opt:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={(e) => { e.stopPropagation(); handleAddOption(); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 
                hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add another option
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================

// MAIN SURVEY BUILDER COMPONENT
// ============================================================
const SurveyBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // State
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeDragType, setActiveDragType] = useState(null); // 'new' or 'reorder'
  const [isOverWorkspace, setIsOverWorkspace] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
  });

  // DnD-kit sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } 
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates 
    })
  );

  // Fetch existing survey if editing
  useEffect(() => {
    if (isEditing) {
      fetchSurvey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/surveys/${id}`);
      const survey = response.data.data;
      
      setFormData({
        title: survey.title || '',
        description: survey.description || '',
        questions: (survey.questions || []).map((q) => ({
          ...q,
          id: q.id ? String(q.id) : generateId(),
          options: q.options || (q.question_type === 'mcq' ? ['Option 1', 'Option 2'] : []),
        })),
      });
    } catch (error) {
      console.error('Error loading survey:', error);
      toast.error('Could not load survey');
      navigate('/surveys');
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Check if dragging a new question type or reordering existing
    if (active.data.current?.type === 'new-question') {
      setActiveDragType('new');
    } else {
      setActiveDragType('reorder');
    }
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setIsOverWorkspace(over?.id === 'workspace' || formData.questions.some(q => q.id === over?.id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveDragType(null);
    setIsOverWorkspace(false);
    
    if (!over) return;

    // Handle dropping a NEW question type onto the workspace
    if (active.data.current?.type === 'new-question') {
      const isDroppedOnWorkspace = over.id === 'workspace' || formData.questions.some(q => q.id === over.id);
      
      if (isDroppedOnWorkspace) {
        const questionType = active.data.current.questionType;
        const newQuestion = {
          id: generateId(),
          question_type: questionType,
          question_text: '',
          is_required: true,
          options: questionType === 'mcq' ? ['Option 1', 'Option 2'] : [],
        };
        
        // If dropped on a specific question, insert after it
        if (over.id !== 'workspace' && formData.questions.some(q => q.id === over.id)) {
          const overIndex = formData.questions.findIndex(q => q.id === over.id);
          setFormData((prev) => {
            const newQuestions = [...prev.questions];
            newQuestions.splice(overIndex + 1, 0, newQuestion);
            return { ...prev, questions: newQuestions };
          });
        } else {
          // Add to end
          setFormData((prev) => ({ 
            ...prev, 
            questions: [...prev.questions, newQuestion] 
          }));
        }
        
        setSelectedQuestionId(newQuestion.id);
        toast.success(`${QUESTION_TYPES.find(t => t.type === questionType)?.label} added!`);
        
        // Scroll to bottom after adding
        setTimeout(() => {
          const workspace = document.getElementById('survey-workspace');
          if (workspace) workspace.scrollTop = workspace.scrollHeight;
        }, 100);
      }
      return;
    }
    
    // Handle REORDERING existing questions
    if (active.id !== over.id && formData.questions.some(q => q.id === over.id)) {
      setFormData((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) };
        }
        return prev;
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveDragType(null);
    setIsOverWorkspace(false);
  };

  // Question management
  const handleUpdateQuestion = (updatedQuestion) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    }));
  };

  const handleDuplicateQuestion = (question) => {
    const duplicated = {
      ...question,
      id: generateId(),
      question_text: question.question_text ? `${question.question_text} (copy)` : '',
    };
    
    setFormData((prev) => {
      const index = prev.questions.findIndex(q => q.id === question.id);
      const newQuestions = [...prev.questions];
      newQuestions.splice(index + 1, 0, duplicated);
      return { ...prev, questions: newQuestions };
    });
    
    toast.success('Question duplicated');
  };

  const handleDeleteQuestion = (question) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== question.id),
    }));
    
    if (selectedQuestionId === question.id) {
      setSelectedQuestionId(null);
    }
    
    toast.success('Question deleted');
  };

  // Save survey
  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please add a survey title');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    
    const emptyQuestion = formData.questions.find(q => !q.question_text?.trim());
    if (emptyQuestion) {
      toast.error('Please fill in all question texts');
      setSelectedQuestionId(emptyQuestion.id);
      return;
    }

    // Validate MCQ options
    const invalidMcq = formData.questions.find(
      q => q.question_type === 'mcq' && 
        (!q.options || q.options.filter(o => o.trim()).length < 2)
    );
    if (invalidMcq) {
      toast.error('Multiple choice questions need at least 2 options');
      setSelectedQuestionId(invalidMcq.id);
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data for backend
      const questionsData = formData.questions.map((q, index) => ({
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        is_required: q.is_required,
        display_order: index,
        options: q.question_type === 'mcq' 
          ? q.options.filter(o => o.trim()).map(o => o.trim())
          : null,
      }));

      if (isEditing) {
        // Update existing survey
        await api.put(`/surveys/${id}`, {
          title: formData.title.trim(),
          description: formData.description.trim(),
        });
        
        toast.success('Survey saved successfully!');
        navigate('/surveys');
      } else {
        // Create new survey
        const response = await api.post('/surveys/create', {
          title: formData.title.trim(),
          description: formData.description.trim(),
          questions: questionsData,
        });
        
        toast.success('Survey created successfully!');
        navigate(`/surveys/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save survey');
    } finally {
      setSaving(false);
    }
  };

  // Check if save should be disabled
  const isSaveDisabled = !formData.title.trim() || formData.questions.length === 0;

  // Get active question for drag overlay
  const activeQuestion = activeId && activeDragType === 'reorder'
    ? formData.questions.find(q => q.id === activeId) 
    : null;
  
  // Get active question type for new question drag overlay
  const activeNewQuestionType = activeId && activeDragType === 'new'
    ? QUESTION_TYPES.find(t => `new-${t.type}` === activeId)
    : null;

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-150px)] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">Loading survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/surveys')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Survey' : 'Create New Survey'}
            </h1>
            <p className="text-sm text-gray-500">
              {formData.questions.length === 0 
                ? 'Add questions to build your survey' 
                : `${formData.questions.length} question${formData.questions.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            icon={Eye} 
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Back to Builder' : 'Preview'}
          </Button>
          <Button 
            icon={Save} 
            onClick={handleSave} 
            loading={saving}
            disabled={isSaveDisabled}
          >
            {isEditing ? 'Save Changes' : 'Create Survey'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {showPreview ? (
        /* ============ PREVIEW MODE ============ */
        <div className="flex-1 overflow-y-auto bg-gray-100 rounded-xl p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.title || 'Untitled Survey'}
              </h2>
              {formData.description && (
                <p className="text-gray-600 mt-2">{formData.description}</p>
              )}
            </div>
            
            {formData.questions.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No questions to preview</p>
            ) : (
              <div className="space-y-6">
                {formData.questions.map((q, i) => (
                  <div key={q.id} className="p-5 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-800 mb-4">
                      {i + 1}. {q.question_text || 'Untitled Question'}
                      {q.is_required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    
                    {q.question_type === 'rating' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            className="w-12 h-12 rounded-xl bg-white border border-gray-200 
                              hover:border-amber-400 hover:bg-amber-50 transition-all"
                          >
                            <Star className="w-6 h-6 text-gray-300 mx-auto" />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {q.question_type === 'text' && (
                      <textarea 
                        className="w-full p-4 border border-gray-200 rounded-xl bg-white resize-none
                          focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                        rows={3}
                        placeholder="Type your answer here..."
                      />
                    )}
                    
                    {q.question_type === 'mcq' && (
                      <div className="space-y-2">
                        {(q.options || []).map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl 
                            border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {formData.questions.length > 0 && (
              <button className="w-full mt-8 py-4 bg-primary-500 text-white font-semibold rounded-xl 
                cursor-not-allowed opacity-60">
                Submit Feedback
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ============ BUILDER MODE ============ */
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Left Panel - Question Types */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1 overflow-y-auto">
              {/* Question Types */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Add Question</h3>
                <p className="text-sm text-gray-500 mb-4">Drag and drop onto the canvas →</p>
                <div className="space-y-3">
                  {QUESTION_TYPES.map((type) => (
                    <DraggableQuestionType 
                      key={type.type} 
                      type={type} 
                    />
                  ))}
                </div>
              </div>

              {/* Survey Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Survey Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Survey Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Customer Feedback Survey"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What is this survey about?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Survey Workspace */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col min-h-0">
            <div className={`bg-gray-100 rounded-xl border-2 flex-1 overflow-hidden flex flex-col transition-all duration-300
              ${isOverWorkspace ? 'border-primary-400 bg-primary-50/30' : 'border-gray-200'}`}>
              <div className="p-4 bg-white border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  Your Questions
                  {formData.questions.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {formData.questions.length}
                    </span>
                  )}
                </h3>
              </div>
              
              <DroppableWorkspace isOver={isOverWorkspace} isEmpty={formData.questions.length === 0}>
                <SortableContext 
                  items={formData.questions.map(q => q.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {formData.questions.map((question, index) => (
                      <SortableQuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        isSelected={selectedQuestionId === question.id}
                        onSelect={(q) => setSelectedQuestionId(q.id)}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                        onDuplicate={handleDuplicateQuestion}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableWorkspace>
            </div>
          </div>
        </div>
        
        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'ease-out',
        }}>
          {activeNewQuestionType ? (
            // Dragging a new question type
            <div className={`p-4 rounded-xl border-2 ${activeNewQuestionType.borderColor} ${activeNewQuestionType.bgColor} shadow-2xl`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <activeNewQuestionType.icon className={`w-6 h-6 ${activeNewQuestionType.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{activeNewQuestionType.label}</p>
                  <p className="text-sm text-gray-500">{activeNewQuestionType.description}</p>
                </div>
              </div>
            </div>
          ) : activeQuestion ? (
            // Reordering an existing question
            <div className="bg-white rounded-xl border-2 border-primary-400 shadow-2xl p-4 opacity-95">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-800">
                  {activeQuestion.question_text || 'Untitled Question'}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default SurveyBuilder;
