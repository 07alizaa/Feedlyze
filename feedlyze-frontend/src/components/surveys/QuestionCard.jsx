// src/components/surveys/QuestionCard.jsx
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Edit3,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  AlignLeft,
  ListChecks,
  ToggleRight,
} from 'lucide-react';
import { Badge } from '../common';

const QuestionCard = ({ 
  question, 
  index, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleRequired,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // dnd-kit sortable hook
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
    opacity: isDragging ? 0.5 : 1,
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'rating':
        return <Star className="w-4 h-4 text-warning-500" />;
      case 'text':
        return <AlignLeft className="w-4 h-4 text-primary-500" />;
      case 'mcq':
        return <ListChecks className="w-4 h-4 text-success-500" />;
      default:
        return <AlignLeft className="w-4 h-4 text-dark-500" />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'rating':
        return 'Rating';
      case 'text':
        return 'Text';
      case 'mcq':
        return 'Multiple Choice';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-light-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors ${isDragging ? 'shadow-lg ring-2 ring-primary-200' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-light-50 border-b border-light-200">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-light-200 touch-none"
        >
          <GripVertical className="w-5 h-5 text-dark-400" />
        </div>

        {/* Question Number & Type */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5">
            {getQuestionTypeIcon(question.question_type)}
            <span className="text-sm text-dark-600">{getQuestionTypeLabel(question.question_type)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex-1 flex items-center gap-2">
          {question.is_required && (
            <Badge variant="danger" size="sm">Required</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleRequired(question)}
            className="p-2 rounded-lg hover:bg-light-200 text-dark-500"
            title={question.is_required ? 'Make optional' : 'Make required'}
          >
            <ToggleRight className={`w-4 h-4 ${question.is_required ? 'text-danger-500' : 'text-dark-400'}`} />
          </button>
          <button
            onClick={() => onEdit(question)}
            className="p-2 rounded-lg hover:bg-light-200 text-dark-500"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(question)}
            className="p-2 rounded-lg hover:bg-light-200 text-dark-500"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question)}
            className="p-2 rounded-lg hover:bg-danger-50 text-danger-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-light-200 text-dark-500"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          <p className="text-dark-700 font-medium">{question.question_text}</p>
          
          {/* Preview based on type */}
          <div className="mt-3">
            {question.question_type === 'rating' && (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-6 h-6 text-light-300"
                    fill="currentColor"
                  />
                ))}
                <span className="text-sm text-dark-400 ml-2">(1-5 stars)</span>
              </div>
            )}

            {question.question_type === 'text' && (
              <div className="bg-light-50 border border-light-200 rounded-lg p-3 text-dark-400 text-sm">
                {question.placeholder || 'Customer will type their response here...'}
              </div>
            )}

            {question.question_type === 'mcq' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-light-300 rounded-full" />
                    <span className="text-sm text-dark-600">{option}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
