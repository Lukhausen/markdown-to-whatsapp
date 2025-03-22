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
  let output = text;
  rules.forEach(rule => {
    // Ensure global flag is always applied
    // Apply multiline flag if pattern hints at line-based matching
    const flags = 'g' + (rule.pattern.toString().includes('^') || rule.pattern.toString().includes('$') ? 'm' : '');

    const pattern = rule.pattern instanceof RegExp
      ? rule.pattern
      : new RegExp(rule.pattern, flags); // Apply combined flags

    output = output.replace(pattern, rule.replacement);
  });
  return output;
}
