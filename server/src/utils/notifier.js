// Notifier - POST to evaluation URL with exponential backoff
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * Notify evaluator with exponential backoff retries
 * @param {string} evaluationUrl - URL to POST to
 * @param {Object} payload - JSON payload
 * @param {number} maxRetries - Maximum retry attempts (default 6)
 * @returns {boolean} Success status
 */
export async function notifyEvaluator(evaluationUrl, payload, maxRetries = 6) {
  console.log(`Notifying evaluator at ${evaluationUrl}`);
  
  const delays = [1000, 2000, 4000, 8000, 16000, 32000]; // 1, 2, 4, 8, 16, 32 seconds
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(evaluationUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      });
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`Notification successful (attempt ${attempt + 1})`);
        
        // Save successful notification
        await fs.writeFile(
          path.join(process.cwd(), 'last-notify.json'),
          JSON.stringify({
            timestamp: new Date().toISOString(),
            attempt: attempt + 1,
            status: response.status,
            payload
          }, null, 2)
        );
        
        return true;
      } else {
        console.warn(`Notification returned non-2xx status: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`Notification attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries - 1) {
        const delay = delays[attempt];
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All notification attempts failed');
  
  // Save failure record
  await fs.writeFile(
    path.join(process.cwd(), 'notify-failure.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      evaluation_url: evaluationUrl,
      payload,
      error: 'All notification attempts failed'
    }, null, 2)
  );
  
  return false;
}
