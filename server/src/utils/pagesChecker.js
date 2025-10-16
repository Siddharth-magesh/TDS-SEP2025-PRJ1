// Pages Checker - poll GitHub Pages URL until HTTP 200
import axios from 'axios';

/**
 * Poll pages URL until it returns HTTP 200 or timeout
 * @param {string} pagesUrl - GitHub Pages URL
 * @param {number} timeout - Timeout in milliseconds (default 9 minutes)
 * @returns {boolean} True if Pages became ready, false if timeout
 */
export async function pollPagesUrl(pagesUrl, timeout = 9 * 60 * 1000) {
  console.log(`Polling ${pagesUrl} for readiness (timeout: ${timeout / 1000}s)`);
  
  const startTime = Date.now();
  const pollInterval = 10000; // Poll every 10 seconds
  let attempts = 0;
  
  while (Date.now() - startTime < timeout) {
    attempts++;
    
    try {
      const response = await axios.get(pagesUrl, {
        timeout: 5000,
        validateStatus: () => true // Accept any status code
      });
      
      if (response.status === 200) {
        console.log(`Pages ready! (${attempts} attempts, ${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
        return true;
      } else {
        console.log(`Pages not ready yet (status ${response.status}), attempt ${attempts}`);
      }
      
    } catch (error) {
      console.log(`Pages check failed (${error.message}), attempt ${attempts}`);
    }
    
    // Wait before next poll
    const elapsed = Date.now() - startTime;
    if (elapsed < timeout) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  console.warn(`Pages did not become ready within ${timeout / 1000}s (${attempts} attempts)`);
  return false;
}
