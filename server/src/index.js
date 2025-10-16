// Main HTTP server for LLM Code Deployment
import express from 'express';
import dotenv from 'dotenv';
import { handleTask } from './handlers/handleTask.js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main task endpoint
app.post('/task', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Task request received`);
  
  try {
    // Log request to tasks-log.json
    const logEntry = {
      timestamp,
      body: { ...req.body, secret: '***REDACTED***' }
    };
    
    const logPath = path.join(process.cwd(), 'tasks-log.json');
    let logs = [];
    try {
      const existingLogs = await fs.readFile(logPath, 'utf-8');
      logs = JSON.parse(existingLogs);
    } catch (err) {
      // File doesn't exist yet, start fresh
    }
    logs.push(logEntry);
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
    
    // Handle the task (async processing but respond quickly)
    const result = await handleTask(req.body);
    res.json(result);
  } catch (error) {
    console.error(`[${timestamp}] Error processing task:`, error.message);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Internal server error',
      timestamp
    });
  }
});

// Test evaluator endpoint (for local testing)
app.post('/test-evaluator', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Test evaluator received notification:`, req.body);
  res.json({ status: 'received', timestamp });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Validate required environment variables
  const required = ['WORKER_SECRET', 'GITHUB_TOKEN', 'GITHUB_USER_OR_ORG'];
  const missing = required.filter(key => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.warn(`WARNING: Missing required environment variables: ${missing.join(', ')}`);
    console.warn('Server will reject requests until these are set.');
  } else {
    console.log('All required environment variables are set.');
  }
});
