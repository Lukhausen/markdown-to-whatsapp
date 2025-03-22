import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import defaultRules from '../rules.json';

// Generate a unique ID
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function SettingsPage({ rules, onRulesChange }) {
  // Add IDs to rules that don't have them
  const [items, setItems] = useState(() => 
    rules.map(rule => rule.id ? rule : { ...rule, id: generateId() })
  );
  
  // Track the ID of the newly created rule to focus it
  const [newRuleId, setNewRuleId] = useState(null);
  const placeholderRef = useRef(null);
  const [hasFocused, setHasFocused] = useState(false);

  // Ensure rules have IDs when props change
  useEffect(() => {
    const rulesWithIds = rules.map(rule => rule.id ? rule : { ...rule, id: generateId() });
    setItems(rulesWithIds);
  }, [rules]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return items;
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        onRulesChange(newItems);
        return newItems;
      });
    }
  };

  const handleEditRule = (id, updatedRule) => {
    // Regular rule update
    const newItems = items.map(item => 
      item.id === id ? updatedRule : item
    );
    
    setItems(newItems);
    onRulesChange(newItems);
  };

  const handleDeleteRule = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    onRulesChange(newItems);
  };
  
  const createNewRule = useCallback(() => {
    // Create a new rule with empty pattern and replacement
    const newRuleId = generateId();
    const newRule = { 
      id: newRuleId, 
      pattern: '', 
      replacement: '' 
    };
    
    const newItems = [...items, newRule];
    setItems(newItems);
    onRulesChange(newItems);
    
    // Set the ID of the new rule so it can be focused
    setNewRuleId(newRuleId);
    
    return newRuleId;
  }, [items, onRulesChange]);

  const handlePlaceholderClick = useCallback((e) => {
    // If clicking directly on the placeholder (not on any existing input)
    if (e.target === placeholderRef.current) {
      createNewRule();
    }
  }, [createNewRule]);

  const handleInputFocus = useCallback(() => {
    // Only create a new rule if we haven't already done so
    if (!hasFocused) {
      setHasFocused(true);
      // Schedule the state update for after the render cycle
      setTimeout(() => {
        createNewRule();
        setHasFocused(false);
      }, 0);
    }
  }, [createNewRule, hasFocused]);
  
  const resetToDefaults = useCallback(() => {
    // Add IDs to default rules
    const rulesWithIds = defaultRules.map(rule => ({
      ...rule,
      id: generateId()
    }));
    
    // Update the state and notify parent
    setItems(rulesWithIds);
    onRulesChange(rulesWithIds);
    
    // Clear any localStorage saved rules
    localStorage.removeItem('formattingRules');
  }, [onRulesChange]);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Formatting Rules</h2>
        <button 
          className="reset-defaults-btn" 
          onClick={resetToDefaults} 
          title="Reset to default rules"
        >
          Reset to Defaults
        </button>
      </div>
      
      <div className="rules-container">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((rule) => (
              <SortableItem
                key={rule.id}
                id={rule.id}
                rule={rule}
                onEdit={handleEditRule}
                onDelete={handleDeleteRule}
                isNew={rule.id === newRuleId}
                onFocused={() => setNewRuleId(null)}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {/* Placeholder for adding a new rule */}
        <div 
          className="rule-item placeholder"
          ref={placeholderRef}
          onClick={handlePlaceholderClick}
        >
          <div className="rule-handle">⋮⋮</div>
          <div className="rule-content">
            <div className="rule-field">
              <span className="rule-label">Pattern:</span> 
              <input
                type="text"
                placeholder="Add new pattern..."
                className="rule-input"
                onFocus={handleInputFocus}
              />
            </div>
            <div className="rule-field">
              <span className="rule-label">Replacement:</span> 
              <input
                type="text"
                placeholder="Add replacement text..."
                className="rule-input"
                onFocus={handleInputFocus}
              />
            </div>
          </div>
          <div className="delete-btn-placeholder"></div>
        </div>
      </div>
    </div>
  );
} 