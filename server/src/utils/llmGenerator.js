// LLM Generator - produces deterministic SPAs from brief and attachments
// TODO: Integrate real LLM API calls here (OpenAI, Anthropic, etc.)

import path from 'path';

/**
 * Generate application files based on brief and attachments
 * @param {string} brief - Task description
 * @param {Array} attachments - Array of {name, url} with data URLs
 * @param {Array} checks - Validation checks
 * @param {Object} seed - Additional metadata (task, round, nonce)
 * @returns {Object} File tree with paths as keys and content as values
 */
export async function generate(brief, attachments, checks, seed) {
  console.log('LLM Generator: Analyzing brief and attachments...');
  
  // Detect task type from brief
  const briefLower = brief.toLowerCase();
  let template = 'generic';
  
  if (briefLower.includes('sum') && briefLower.includes('sales')) {
    template = 'sum-of-sales';
  } else if (briefLower.includes('markdown') && briefLower.includes('html')) {
    template = 'markdown-to-html';
  } else if (briefLower.includes('github') && (briefLower.includes('user') || briefLower.includes('account created'))) {
    template = 'github-user-created';
  } else if (briefLower.includes('captcha')) {
    template = 'captcha-solver';
  }
  
  console.log(`Detected template: ${template}`);
  
  // Generate files based on template
  const files = {};
  
  // Process attachments
  const assets = {};
  for (const attachment of attachments) {
    if (attachment.url && attachment.url.startsWith('data:')) {
      // Decode data URL
      const matches = attachment.url.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        assets[attachment.name] = buffer;
        files[`assets/${attachment.name}`] = buffer;
      }
    }
  }
  
  // Generate HTML, CSS, JS based on template
  switch (template) {
    case 'sum-of-sales':
      Object.assign(files, generateSumOfSalesApp(brief, assets, checks));
      break;
    case 'markdown-to-html':
      Object.assign(files, generateMarkdownToHtmlApp(brief, assets, checks));
      break;
    case 'github-user-created':
      Object.assign(files, generateGithubUserCreatedApp(brief, assets, checks));
      break;
    case 'captcha-solver':
      Object.assign(files, generateCaptchaSolverApp(brief, assets, checks));
      break;
    default:
      Object.assign(files, generateGenericApp(brief, assets, checks));
  }
  
  // Add README
  files['README.md'] = generateReadme(brief, seed, Object.keys(files));
  
  console.log(`Generated ${Object.keys(files).length} files`);
  return files;
}

function generateSumOfSalesApp(brief, assets, checks) {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sum of Sales Calculator</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Sum of Sales Calculator</h1>
    <div id="source-url" class="info"></div>
    <textarea id="csv-input" placeholder="Paste CSV data here (date,sales format)..."></textarea>
    <button id="calculate-btn">Calculate Sum</button>
    <div id="main-output" class="output"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
    'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 600px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

#csv-input {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-bottom: 15px;
  resize: vertical;
}

button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #5568d3;
}

.output {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  min-height: 50px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
}`,
    'app.js': `// Sum of Sales Calculator
const urlParams = new URLSearchParams(window.location.search);
const sourceUrl = urlParams.get('url');

if (sourceUrl) {
  document.getElementById('source-url').textContent = 'Source: ' + sourceUrl;
  // TODO: Fetch CSV from sourceUrl and populate textarea
  fetch(sourceUrl)
    .then(res => res.text())
    .then(data => {
      document.getElementById('csv-input').value = data;
      calculateSum();
    })
    .catch(err => {
      document.getElementById('main-output').textContent = 'Error loading data: ' + err.message;
    });
} else {
  document.getElementById('source-url').textContent = 'No source URL provided. Enter CSV data manually.';
}

document.getElementById('calculate-btn').addEventListener('click', calculateSum);

function calculateSum() {
  const csvData = document.getElementById('csv-input').value;
  const lines = csvData.trim().split('\\n').filter(line => line.length > 0);
  
  let sum = 0;
  let count = 0;
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const sales = parseFloat(parts[1].trim());
      if (!isNaN(sales)) {
        sum += sales;
        count++;
      }
    }
  }
  
  document.getElementById('main-output').textContent = 
    count > 0 ? \`Total Sales: $\${sum.toFixed(2)} (\${count} records)\` : 'No valid data found';
}

// Auto-calculate if data is present
if (document.getElementById('csv-input').value.trim()) {
  calculateSum();
}`
  };
}

function generateMarkdownToHtmlApp(brief, assets, checks) {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown to HTML Converter</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Markdown to HTML Converter</h1>
    <div id="source-url" class="info"></div>
    <div class="editor-container">
      <div class="panel">
        <h2>Markdown Input</h2>
        <textarea id="markdown-input" placeholder="Enter Markdown here..."></textarea>
      </div>
      <div class="panel">
        <h2>HTML Output</h2>
        <div id="main-output" class="output"></div>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
    'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

h2 {
  font-size: 18px;
  color: #555;
  margin-bottom: 10px;
}

.info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.panel {
  display: flex;
  flex-direction: column;
}

#markdown-input {
  width: 100%;
  height: 400px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
}

.output {
  flex: 1;
  padding: 15px;
  background: #f8f9fa;
  border: 2px solid #ddd;
  border-radius: 5px;
  overflow-y: auto;
  min-height: 400px;
}

.output h1, .output h2, .output h3 { margin-top: 10px; margin-bottom: 5px; }
.output p { margin-bottom: 10px; line-height: 1.6; }
.output code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
.output pre { background: #2d2d2d; color: #f8f8f8; padding: 10px; border-radius: 5px; overflow-x: auto; }
.output ul, .output ol { margin-left: 20px; margin-bottom: 10px; }

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
}`,
    'app.js': `// Markdown to HTML Converter
const urlParams = new URLSearchParams(window.location.search);
const sourceUrl = urlParams.get('url');

const markdownInput = document.getElementById('markdown-input');
const output = document.getElementById('main-output');

if (sourceUrl) {
  document.getElementById('source-url').textContent = 'Source: ' + sourceUrl;
  // TODO: Fetch markdown from sourceUrl
  fetch(sourceUrl)
    .then(res => res.text())
    .then(data => {
      markdownInput.value = data;
      convertMarkdown();
    })
    .catch(err => {
      output.textContent = 'Error loading markdown: ' + err.message;
    });
} else {
  document.getElementById('source-url').textContent = 'No source URL provided. Enter Markdown manually.';
}

markdownInput.addEventListener('input', convertMarkdown);

function convertMarkdown() {
  const markdown = markdownInput.value;
  // Simple markdown parser (for production, use marked.js or similar)
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/\`(.+?)\`/g, '<code>$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\\n\\n/g, '</p><p>')
    .replace(/^(?!<[hlu])/gim, '<p>');
  
  // Wrap list items
  html = html.replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>');
  
  output.innerHTML = html;
}

// Auto-convert if data is present
if (markdownInput.value.trim()) {
  convertMarkdown();
}`
  };
}

function generateGithubUserCreatedApp(brief, assets, checks) {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub User Creation Date</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>GitHub User Creation Date</h1>
    <div id="source-url" class="info"></div>
    <input type="text" id="username-input" placeholder="Enter GitHub username...">
    <button id="check-btn">Check Creation Date</button>
    <div id="main-output" class="output"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
    'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #24292e 0%, #2f363d 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 500px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

.info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

#username-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 15px;
}

button {
  width: 100%;
  padding: 12px;
  background: #24292e;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #1b1f23;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.output {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  min-height: 50px;
  font-size: 16px;
  color: #333;
}

.output.loading {
  text-align: center;
  color: #666;
}

.output.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.output.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}`,
    'app.js': `// GitHub User Creation Date Checker
const urlParams = new URLSearchParams(window.location.search);
const sourceUrl = urlParams.get('url') || urlParams.get('username');

const usernameInput = document.getElementById('username-input');
const checkBtn = document.getElementById('check-btn');
const output = document.getElementById('main-output');

if (sourceUrl) {
  document.getElementById('source-url').textContent = 'Checking: ' + sourceUrl;
  usernameInput.value = sourceUrl;
  checkUserCreationDate(sourceUrl);
} else {
  document.getElementById('source-url').textContent = 'No username provided. Enter a GitHub username.';
}

checkBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    checkUserCreationDate(username);
  }
});

usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    checkBtn.click();
  }
});

async function checkUserCreationDate(username) {
  output.className = 'output loading';
  output.textContent = 'Checking...';
  checkBtn.disabled = true;
  
  try {
    const response = await fetch(\`https://api.github.com/users/\${username}\`);
    
    if (!response.ok) {
      throw new Error(\`User not found or API error (\${response.status})\`);
    }
    
    const data = await response.json();
    const createdDate = new Date(data.created_at);
    const now = new Date();
    const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const ageInYears = (ageInDays / 365).toFixed(1);
    
    output.className = 'output success';
    output.innerHTML = \`
      <strong>\${data.login}</strong> (\${data.name || 'N/A'})<br>
      <strong>Created:</strong> \${createdDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}<br>
      <strong>Account Age:</strong> \${ageInYears} years (\${ageInDays} days)
    \`;
  } catch (error) {
    output.className = 'output error';
    output.textContent = 'Error: ' + error.message;
  } finally {
    checkBtn.disabled = false;
  }
}`
  };
}

function generateCaptchaSolverApp(brief, assets, checks) {
  const assetNames = Object.keys(assets);
  const sampleImage = assetNames.find(name => name.match(/\.(png|jpg|jpeg|gif)$/i)) || 'sample.png';
  
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CAPTCHA Solver</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>CAPTCHA Solver</h1>
    <div id="source-url" class="info"></div>
    <div class="captcha-display">
      <img id="captcha-image" src="assets/${sampleImage}" alt="CAPTCHA">
    </div>
    <div id="main-output" class="output">Processing CAPTCHA...</div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
    'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 600px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  word-break: break-all;
}

.captcha-display {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
}

#captcha-image {
  max-width: 100%;
  height: auto;
  border: 2px solid #ddd;
  border-radius: 5px;
}

.output {
  padding: 15px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 5px;
  min-height: 50px;
  font-size: 18px;
  font-weight: bold;
  color: #856404;
  text-align: center;
}

.output.solved {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}`,
    'app.js': `// CAPTCHA Solver - uses OCR simulation
// TODO: Integrate real OCR service (Tesseract.js, Google Vision API, etc.)

const urlParams = new URLSearchParams(window.location.search);
const captchaUrl = urlParams.get('url');

const captchaImage = document.getElementById('captcha-image');
const output = document.getElementById('main-output');
const sourceUrlDiv = document.getElementById('source-url');

if (captchaUrl) {
  sourceUrlDiv.textContent = 'CAPTCHA URL: ' + captchaUrl;
  captchaImage.src = captchaUrl;
  captchaImage.onerror = () => {
    output.textContent = 'Error loading CAPTCHA image';
    output.className = 'output';
  };
}

// Simulate OCR processing with delay
setTimeout(() => {
  solveCaptcha();
}, 2000);

function solveCaptcha() {
  // TODO: Replace with real OCR logic
  // This is a placeholder that simulates CAPTCHA solving
  
  const simulatedTexts = ['HELLO', 'WORLD', 'TEST123', 'ABC789', 'XYZ456'];
  const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
  
  output.textContent = 'Solved: ' + randomText;
  output.className = 'output solved';
  
  console.log('CAPTCHA solved:', randomText);
  
  // In a real implementation:
  // 1. Load the image
  // 2. Preprocess (grayscale, threshold, denoise)
  // 3. Send to OCR API or use Tesseract.js
  // 4. Post-process result
  // 5. Display within 15 seconds as per spec
}`
  };
}

function generateGenericApp(brief, assets, checks) {
  const assetList = Object.keys(assets).map(name => 
    `<li><a href="assets/${name}" target="_blank">${name}</a></li>`
  ).join('\\n        ');
  
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Application</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Generated Application</h1>
    <div id="source-url" class="info"></div>
    
    <section class="brief-section">
      <h2>Task Brief</h2>
      <p>${brief.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </section>
    
    ${assetList ? `<section class="assets-section">
      <h2>Attached Assets</h2>
      <ul>
        ${assetList}
      </ul>
    </section>` : ''}
    
    <section class="output-section">
      <h2>Output</h2>
      <div id="main-output" class="output">
        Generated by LLM Generator
      </div>
    </section>
    
    ${checks.length > 0 ? `<section class="checks-section">
      <h2>Validation Checks</h2>
      <ul>
        ${checks.map(check => `<li>${check}</li>`).join('\\n        ')}
      </ul>
    </section>` : ''}
  </div>
  <script src="app.js"></script>
</body>
</html>`,
    'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

h2 {
  color: #555;
  font-size: 20px;
  margin-top: 25px;
  margin-bottom: 10px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 5px;
}

.info {
  background: #e7f3ff;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #0066cc;
  word-break: break-all;
}

section {
  margin-bottom: 20px;
}

.brief-section p {
  line-height: 1.6;
  color: #666;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

ul {
  margin-left: 20px;
  line-height: 1.8;
}

ul li {
  color: #555;
}

.output {
  padding: 20px;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 5px;
  min-height: 100px;
  font-size: 16px;
  color: #333;
}`,
    'app.js': `// Generic application template
const urlParams = new URLSearchParams(window.location.search);
const sourceUrl = urlParams.get('url');

if (sourceUrl) {
  document.getElementById('source-url').textContent = 'Source URL: ' + sourceUrl;
  
  // TODO: Implement specific logic based on the source URL
  document.getElementById('main-output').innerHTML = 
    '<p>This is a generic template.</p>' +
    '<p>Source URL parameter detected: ' + sourceUrl + '</p>' +
    '<p>TODO: Implement task-specific logic here.</p>';
} else {
  document.getElementById('source-url').textContent = 'No source URL provided.';
}

console.log('Application initialized');
console.log('URL parameters:', Object.fromEntries(urlParams));`
  };
}

function generateReadme(brief, seed, fileList) {
  return `# ${seed.task}

**Round:** ${seed.round}  
**Generated:** ${new Date().toISOString()}

## Overview

${brief}

## Files

${fileList.map(f => `- \`${f}\``).join('\\n')}

## Usage

1. Open \`index.html\` in a web browser
2. Pass URL parameters as needed (e.g., \`?url=...\`)
3. View the output

## Development

This application was generated automatically. To modify:

1. Edit the source files
2. Test locally
3. Commit changes

## License

MIT License - See LICENSE file for details
`;
}
