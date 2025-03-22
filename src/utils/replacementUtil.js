/**
 * Transforms input text based on a set of formatting rules.
 *
 * Each rule should be an object with:
 * - `pattern`: A RegExp pattern string or RegExp object.
 * - `replacement`: A string or a function to generate the replacement.
 *
 * The replacement is always treated as global. Multiline is automatically
 * handled for patterns that include '^' or '$'.
 *
 * Example rules:
 *   // Convert **text** to *text* (global replacement)
 *   { pattern: /\*\*(.*?)\*\* /, replacement: "*$1*" },
 *
 *   // Convert lines starting with '#' into a special formatted line:
 *   // "#Title\n" becomes "*_Title_*" followed by a newline. (multiline)
 *   { pattern: /^#(.*?)\n/, replacement: "*_$1_*\n" }
 *
 * @param {string} text - The input plain text.
 * @param {Array<Object>} rules - The list of formatting rules.
 * @returns {string} The transformed text.
 **/
export function applyFormattingRules(text, rules) {
  if (!text || !rules || !Array.isArray(rules)) {
    return text;
  }

  // Create a map to track which parts of the text have been processed
  const replacementMap = new Map();

  // First pass: Mark all parts of the text that should be replaced
  rules.forEach((rule, ruleIndex) => {
    try {
      // Skip invalid rules
      if (!rule || !rule.pattern) {
        console.warn('Invalid rule found:', rule);
        return;
      }

      // Ensure global flag is always applied
      // Apply multiline flag if pattern hints at line-based matching
      const flags = 'g' + (rule.pattern.toString().includes('^') || rule.pattern.toString().includes('$') ? 'm' : '');

      let pattern;
      if (rule.pattern instanceof RegExp) {
        // Create a new RegExp to avoid modifying the original
        pattern = new RegExp(rule.pattern.source, flags);
      } else {
        try {
          // Safely create RegExp
          pattern = new RegExp(rule.pattern, flags);
        } catch (regexError) {
          console.warn('Invalid regex pattern:', rule.pattern, regexError.message);
          return; // Skip this rule
        }
      }

      // Use replace with a function to identify matches without modifying the text yet
      text.replace(pattern, function(match, ...args) {
        const offset = args[args.length - 2];
        const length = match.length;
        
        // Store the rule index, match, and replacement info
        // Only if this part of text hasn't been claimed by a higher priority rule
        let alreadyClaimed = false;
        for (let i = 0; i < offset + length; i++) {
          if (i >= offset && replacementMap.has(i)) {
            alreadyClaimed = true;
            break;
          }
        }
        
        if (!alreadyClaimed) {
          // Generate the replacement text
          const captureGroups = args.slice(0, args.length - 2);
          let replacement;
          
          if (typeof rule.replacement === 'function') {
            replacement = rule.replacement(match, ...captureGroups);
          } else {
            // Handle $1, $2, etc. in replacement string
            let replacementText = rule.replacement;
            captureGroups.forEach((group, i) => {
              if (group !== undefined) {
                replacementText = replacementText.replace(new RegExp('\\$' + (i + 1), 'g'), group);
              }
            });
            replacement = replacementText;
          }
          
          // Mark this region as claimed
          for (let i = offset; i < offset + length; i++) {
            replacementMap.set(i, { 
              ruleIndex,
              original: match,
              replacement,
              start: offset,
              end: offset + length
            });
          }
        }
        
        // Return the original text (we're not making changes yet)
        return match;
      });
    } catch (error) {
      console.error('Error applying formatting rule:', rule, error);
    }
  });

  // Now build the result string based on the replacement map
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    if (replacementMap.has(i)) {
      const { replacement, end } = replacementMap.get(i);
      result += replacement;
      i = end; // Skip to end of the replaced segment
    } else {
      result += text[i];
      i++;
    }
  }
  
  return result;
}
