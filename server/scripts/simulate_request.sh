#!/bin/bash
# Simulate a task request to the server

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:3000}"
WORKER_SECRET="${WORKER_SECRET:-your-secret-key-here}"

echo "Simulating task request to $SERVER_URL/task"
echo "Using secret: ${WORKER_SECRET:0:10}..."
echo ""

# Sample request payload
curl -X POST "$SERVER_URL/task" \
  -H "Content-Type: application/json" \
  -d '{
  "email": "student@example.com",
  "secret": "'"$WORKER_SECRET"'",
  "task": "test-task-'$(date +%s)'",
  "round": 1,
  "nonce": "test-'$(date +%s)'",
  "brief": "Create a simple sum of sales calculator that reads CSV data",
  "checks": [
    "Repo has MIT license",
    "README.md is professional",
    "Page displays input for CSV data",
    "Page calculates sum correctly"
  ],
  "evaluation_url": "'"$SERVER_URL"'/test-evaluator",
  "attachments": []
}'

echo ""
echo ""
echo "Request sent! Check server logs for progress."
echo "View tasks log: cat tasks-log.json | jq ."
