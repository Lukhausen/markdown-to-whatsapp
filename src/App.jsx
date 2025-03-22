import { useState } from 'react'
import './App.css'
import { applyFormattingRules } from './utils/replacementUtil';
import rules from './rules.json';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    setOutputText(applyFormattingRules(event.target.value, rules));
  };

  return (
    <>
      <div>
        <label htmlFor="input-text">Input:</label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={handleInputChange}
          rows={6}
          cols={50}
          placeholder="Try typing **bold text** or start a line with #heading"
        />
      </div>
      <div>
        <label htmlFor="output-text">Output:</label>
        <textarea
          id="output-text"
          value={outputText}
          readOnly
          rows={6}
          cols={50}
        />
      </div>
    </>
  )
}

export default App
