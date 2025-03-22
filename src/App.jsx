import { useState, useEffect, useRef } from 'react'
import './App.css'
import { applyFormattingRules } from './utils/replacementUtil';
import defaultRules from './rules.json';
import { SettingsPage } from './components/SettingsPage';
import './components/SettingsPage.css';

// Generate a unique ID
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Add IDs to rules that don't have them
const addIdsToRules = (rules) => {
  return rules.map(rule => rule.id ? rule : { ...rule, id: generateId() });
};

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  // Add IDs to default rules
  const [rules, setRules] = useState(() => addIdsToRules(defaultRules));
  const [showSettings, setShowSettings] = useState(false);
  const [instantCopy, setInstantCopy] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const outputTextareaRef = useRef(null);

  useEffect(() => {
    // Re-apply formatting whenever rules change
    setOutputText(applyFormattingRules(inputText, rules));
  }, [inputText, rules]);

  useEffect(() => {
    // Copy to clipboard if instant copy is enabled and there's text to copy
    if (instantCopy && outputText) {
      copyToClipboard(outputText);
    }
  }, [outputText, instantCopy]);

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show subtle copy indication
        setJustCopied(true);
        // Reset after animation completes
        setTimeout(() => setJustCopied(false), 500);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Manual copy function for copy button
  const handleManualCopy = () => {
    if (outputText) {
      copyToClipboard(outputText);
    }
  };

  useEffect(() => {
    // Close settings dropdown when clicking outside
    function handleClickOutside(event) {
      // Don't close if clicking inside settings, on the settings button, or if target is an input or button
      if (settingsRef.current && 
          !settingsRef.current.contains(event.target) && 
          settingsButtonRef.current && 
          !settingsButtonRef.current.contains(event.target) &&
          !event.target.closest('input') && 
          !event.target.closest('button')) {
        setShowSettings(false);
      }
    }
    
    // Use mousedown for detecting clicks outside, but not for inputs
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleRulesChange = (newRules) => {
    setRules(newRules);
    // Save to localStorage if you want persistence
    localStorage.setItem('formattingRules', JSON.stringify(newRules));
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggleInstantCopy = () => {
    const newValue = !instantCopy;
    setInstantCopy(newValue);
    // Save to localStorage for persistence
    localStorage.setItem('instantCopy', JSON.stringify(newValue));
    
    // If enabling instant copy and there's already output text, copy it immediately
    if (newValue && outputText) {
      copyToClipboard(outputText);
    }
  };

  // Clear input text
  const clearInput = () => {
    setInputText('');
  };

  // Load rules and settings from localStorage on initial load
  useEffect(() => {
    const savedRules = localStorage.getItem('formattingRules');
    if (savedRules) {
      try {
        const parsedRules = JSON.parse(savedRules);
        // Ensure all rules have IDs
        setRules(addIdsToRules(parsedRules));
      } catch (e) {
        console.error('Failed to parse saved rules', e);
      }
    }
    
    // Load instant copy setting
    const savedInstantCopy = localStorage.getItem('instantCopy');
    if (savedInstantCopy) {
      try {
        setInstantCopy(JSON.parse(savedInstantCopy));
      } catch (e) {
        console.error('Failed to parse saved instant copy setting', e);
      }
    }
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Markdown to WhatsApp Formatter</h1>
        <div className="header-controls">
          <div className="instant-copy-switch">
            <label htmlFor="instant-copy">
              Instant Copy
              <input
                id="instant-copy"
                type="checkbox"
                checked={instantCopy}
                onChange={toggleInstantCopy}
              />
              <span className={`switch ${justCopied && instantCopy ? "glowing" : ""}`}></span>
            </label>
          </div>
          <button 
            onClick={toggleSettings} 
            className="settings-button"
            ref={settingsButtonRef}
            aria-label="Open Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <div className="converter">
        <div className="input-section">
          <div className="section-header">
            <label htmlFor="input-text">Input:</label>
            {inputText && (
              <button 
                onClick={clearInput}
                className="action-button clear-button"
                aria-label="Clear input"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            id="input-text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type your markdown here..."
          />
        </div>
        <div className="output-section">
          <div className="section-header">
            <label htmlFor="output-text">Output:</label>
            {outputText && (
              <button 
                onClick={handleManualCopy}
                className="action-button copy-button"
                aria-label="Copy to clipboard"
              >
                Copy
              </button>
            )}
          </div>
          <textarea
            id="output-text"
            ref={outputTextareaRef}
            value={outputText}
            readOnly
            className={justCopied ? "copied" : ""}
            placeholder="Formatted text will appear here..."
          />
        </div>
      </div>
      
      {showSettings && (
        <div 
          className="settings-dropdown" 
          ref={settingsRef}
          onClick={(e) => e.stopPropagation()}
        >
          <SettingsPage rules={rules} onRulesChange={handleRulesChange} />
        </div>
      )}
    </div>
  )
}

export default App
