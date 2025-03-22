import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef } from 'react';

export function SortableItem({ id, rule, onEdit, onDelete, isNew, onFocused }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const patternInputRef = useRef(null);

  // Auto-focus on the pattern input when a new rule is created
  useEffect(() => {
    if (isNew && patternInputRef.current) {
      patternInputRef.current.focus();
      if (onFocused) onFocused();
    }
  }, [isNew, onFocused]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleChange = (field, value) => {
    onEdit(id, { ...rule, [field]: value });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="rule-item"
    >
      <div className="rule-handle" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className="rule-content">
        <div className="rule-field">
          <span className="rule-label">Pattern:</span> 
          <input
            ref={patternInputRef}
            type="text"
            value={rule.pattern}
            onChange={(e) => handleChange('pattern', e.target.value)}
            className="rule-input"
          />
        </div>
        <div className="rule-field">
          <span className="rule-label">Replacement:</span> 
          <input
            type="text"
            value={rule.replacement}
            onChange={(e) => handleChange('replacement', e.target.value)}
            className="rule-input"
          />
        </div>
        
        {rule.description && (
          <div className="rule-description" title={rule.description}>
            <small>{rule.description}</small>
          </div>
        )}
      </div>
      <button 
        onClick={handleDelete} 
        className="delete-btn" 
        aria-label="Delete rule"
      >
        🗑️
      </button>
    </div>
  );
} 