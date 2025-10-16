// Verify secret middleware
export function verifySecret(secret) {
  const expectedSecret = process.env.WORKER_SECRET;
  
  if (!expectedSecret) {
    const error = new Error('Server misconfigured: WORKER_SECRET not set');
    error.statusCode = 500;
    throw error;
  }
  
  if (secret !== expectedSecret) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] Invalid secret attempt`);
    const error = new Error('invalid secret');
    error.statusCode = 401;
    throw error;
  }
  
  return true;
}
