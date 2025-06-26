#!/bin/bash

# Configuration
APP_ENDPOINT="http://192.168.203.46"  # Change to your service endpoint
DATA_COUNT=10
REQUEST_RATE=5  # Requests per second
DURATION=60     # Test duration in seconds

# Function to generate random data
generate_random_data() {
  local name=$(cat /dev/urandom | tr -dc 'a-zA-Z' | fold -w 8 | head -n 1)
  local domain=$(cat /dev/urandom | tr -dc 'a-z' | fold -w 6 | head -n 1)
  local email="${name}@${domain}.com"
  local message=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9 ' | fold -w 30 | head -n 1)
  
  echo "{\"name\":\"${name}\",\"email\":\"${email}\",\"message\":\"${message}\"}"
}

# Check if the app is running
echo "Testing connection to the application at ${APP_ENDPOINT}..."
if ! curl -s --head "${APP_ENDPOINT}"; then
  echo "Cannot connect to the application. Make sure it's running."
  exit 1
fi

echo "=== Starting Load Test ==="
echo "Generating initial data (${DATA_COUNT} records)..."

# First generate some initial data
curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"count\": ${DATA_COUNT}}" \
  "${APP_ENDPOINT}/api/generate"

echo "Starting continuous traffic generation..."
echo "Duration: ${DURATION} seconds, Rate: ${REQUEST_RATE} req/s"

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
  # Randomly choose between read and write operations
  RAND=$((RANDOM % 10))
  
  if [ $RAND -lt 7 ]; then
    # 70% GET requests
    curl -s "${APP_ENDPOINT}/api/data" > /dev/null
  elif [ $RAND -lt 9 ]; then
    # 20% POST requests
    DATA=$(generate_random_data)
    curl -s -X POST -H "Content-Type: application/json" \
      -d "${DATA}" \
      "${APP_ENDPOINT}/api/data" > /dev/null
  else
    # 10% Data generation requests
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"count\": 5}" \
      "${APP_ENDPOINT}/api/generate" > /dev/null
  fi
  
  # Sleep to maintain the desired request rate
  sleep $(echo "scale=4; 1/${REQUEST_RATE}" | bc)
done

echo "Load test finished."
echo "Total duration: ${DURATION} seconds"
