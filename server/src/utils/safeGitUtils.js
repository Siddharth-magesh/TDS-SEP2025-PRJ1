// Safe Git Utils - check for secrets before committing
const SENSITIVE_PATTERNS = [
  /WORKER_SECRET/gi,
  /GITHUB_TOKEN/gi,
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub PAT pattern
  /sk-[a-zA-Z0-9]{48}/g, // OpenAI API key pattern
  /AIza[0-9A-Za-z_-]{35}/g, // Google API key pattern
  /\b[A-Z0-9]{32,}\b/g // Generic long uppercase alphanumeric strings
];

/**
 * Check content for potential secrets
 * @param {string} content - File content to check
 * @returns {Array<string>} Array of found violations
 */
export function checkForSecrets(content) {
  const violations = [];
  
  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push(...matches);
    }
  }
  
  return violations;
}

/**
 * Scan all files in a directory for secrets
 * @param {Object} files - File tree (path: content)
 * @returns {Object} { safe: boolean, violations: Array }
 */
export function scanFilesForSecrets(files) {
  const violations = {};
  let totalViolations = 0;
  
  for (const [filePath, content] of Object.entries(files)) {
    if (content instanceof Buffer) continue; // Skip binary files
    
    const fileViolations = checkForSecrets(content);
    if (fileViolations.length > 0) {
      violations[filePath] = fileViolations;
      totalViolations += fileViolations.length;
    }
  }
  
  return {
    safe: totalViolations === 0,
    violations,
    count: totalViolations
  };
}

/**
 * Redact secrets from content
 * @param {string} content - Content to clean
 * @returns {string} Cleaned content
 */
export function redactSecrets(content) {
  let cleaned = content;
  
  for (const pattern of SENSITIVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '***REDACTED***');
  }
  
  return cleaned;
}
