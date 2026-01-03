// src/components/surveys/QuestionEditor.jsx
import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Star,
  AlignLeft,
  ListChecks,
} from 'lucide-react';
import { Button, Input, Textarea, Modal } from '../common';

const QUESTION_TYPES = [
  {
    type: 'rating',
    label: 'Rating',
    description: 'Star rating from 1-5',
    icon: Star,
    color: 'warning',
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Open-ended text response',
    icon: AlignLeft,
    color: 'primary',
  },
  {
    type: 'mcq',
    label: 'Multiple Choice',
    description: 'Select from options',
    icon: ListChecks,
    color: 'success',
  },
];

const QuestionEditor = ({ open, onClose, onSave, editingQuestion }) => {
  const [questionType, setQuestionType] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: '',
    is_required: true,
    placeholder: '',
    options: ['', ''],
  });
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setQuestionType(null);
    setFormData({
      question_text: '',
      question_type: '',
      is_required: true,
      placeholder: '',
      options: ['', ''],
    });
    setErrors({});
  };

  // Initialize form when editing question changes
  const prevEditingQuestion = editingQuestion;
  const prevOpen = open;
  
  if (prevOpen && editingQuestion && editingQuestion !== prevEditingQuestion) {
    setQuestionType(editingQuestion.question_type);
    setFormData({
      question_text: editingQuestion.question_text || '',
      question_type: editingQuestion.question_type || '',
      is_required: editingQuestion.is_required ?? true,
      placeholder: editingQuestion.placeholder || '',
      options: editingQuestion.options || ['', ''],
    });
  }

  useEffect(() => {
    if (!open) {
      // Reset when modal closes
      resetForm();
    } else if (editingQuestion) {
      // Populate form when editing
      setQuestionType(editingQuestion.question_type);
      setFormData({
        question_text: editingQuestion.question_text || '',
        question_type: editingQuestion.question_type || '',
        is_required: editingQuestion.is_required ?? true,
        placeholder: editingQuestion.placeholder || '',
        options: editingQuestion.options || ['', ''],
      });
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleTypeSelect = (type) => {
    setQuestionType(type);
    setFormData({ ...formData, question_type: type });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) {
      return; // Minimum 2 options
    }
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (formData.question_type === 'mcq') {
      const filledOptions = formData.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const questionData = {
      ...formData,
      question_text: formData.question_text.trim(),
    };

    // Clean up options for MCQ
    if (formData.question_type === 'mcq') {
      questionData.options = formData.options
        .map(opt => opt.trim())
        .filter(opt => opt);
    } else {
      delete questionData.options;
    }

    // Clean up placeholder for non-text
    if (formData.question_type !== 'text') {
      delete questionData.placeholder;
    }

    onSave(questionData);
    onClose();
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-dark-900">
            {editingQuestion ? 'Edit Question' : 'Add Question'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-light-100 text-dark-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Type Selection */}
        {!questionType && !editingQuestion && (
          <div>
            <p className="text-sm text-dark-500 mb-4">Select a question type:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleTypeSelect(type.type)}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:border-${type.color}-500 hover:bg-${type.color}-50`}
                >
                  <div className={`w-10 h-10 bg-${type.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                    <type.icon className={`w-5 h-5 text-${type.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-dark-900">{type.label}</h3>
                  <p className="text-sm text-dark-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Form */}
        {(questionType || editingQuestion) && (
          <div className="space-y-4">
            {/* Question Type Indicator */}
            <div className="flex items-center gap-2 p-3 bg-light-50 rounded-lg">
              {QUESTION_TYPES.find(t => t.type === formData.question_type)?.icon && (
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  {(() => {
                    const TypeIcon = QUESTION_TYPES.find(t => t.type === formData.question_type)?.icon;
                    return TypeIcon ? <TypeIcon className="w-4 h-4 text-primary-600" /> : null;
                  })()}
                </div>
              )}
              <span className="font-medium text-dark-700">
                {QUESTION_TYPES.find(t => t.type === formData.question_type)?.label} Question
              </span>
              {!editingQuestion && (
                <button
                  onClick={() => setQuestionType(null)}
                  className="ml-auto text-sm text-primary-500 hover:text-primary-600"
                >
                  Change type
                </button>
              )}
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Question Text *
              </label>
              <Textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Enter your question..."
                rows={2}
                error={errors.question_text}
              />
            </div>

            {/* Placeholder for Text Questions */}
            {formData.question_type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Placeholder Text (optional)
                </label>
                <Input
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="e.g., Share your thoughts..."
                />
              </div>
            )}

            {/* Options for MCQ */}
            {formData.question_type === 'mcq' && (
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Options *
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-dark-300" />
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 rounded-lg hover:bg-danger-50 text-danger-500 disabled:opacity-50"
                        disabled={formData.options.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="text-sm text-danger-500 mt-1">{errors.options}</p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddOption}
                  className="mt-2"
                >
                  Add Option
                </Button>
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center justify-between p-3 bg-light-50 rounded-lg">
              <div>
                <p className="font-medium text-dark-700">Required</p>
                <p className="text-sm text-dark-500">Customer must answer this question</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, is_required: !formData.is_required })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.is_required ? 'bg-primary-500' : 'bg-light-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    formData.is_required ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-light-200">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingQuestion ? 'Save Changes' : 'Add Question'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuestionEditor;
