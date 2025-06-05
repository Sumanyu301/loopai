#!/bin/bash

# First request (MEDIUM priority)
echo "Sending MEDIUM priority request..."
RESPONSE1=$(curl -s -X POST http://localhost:3000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3, 4, 5], "priority": "MEDIUM"}')

INGESTION_ID_1=$(echo $RESPONSE1 | grep -o 'ingestion_id":"[^"]*"' | cut -d":" -f2 | tr -d "\"")
echo "Got ingestion ID 1: $INGESTION_ID_1"

# Second request (HIGH priority)
echo -e "\nSending HIGH priority request..."
RESPONSE2=$(curl -s -X POST http://localhost:3000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"ids": [6, 7, 8, 9], "priority": "HIGH"}')

INGESTION_ID_2=$(echo $RESPONSE2 | grep -o 'ingestion_id":"[^"]*"' | cut -d":" -f2 | tr -d "\"")
echo "Got ingestion ID 2: $INGESTION_ID_2"

# Wait a moment for processing to start
sleep 2

# Check status of both requests
echo -e "\nChecking status of first request (MEDIUM priority)..."
curl -s http://localhost:3000/api/v1/status/$INGESTION_ID_1 | json_pp

echo -e "\nChecking status of second request (HIGH priority)..."
curl -s http://localhost:3000/api/v1/status/$INGESTION_ID_2 | json_pp

# Wait for more processing
sleep 5

echo -e "\nChecking status after 5 seconds..."
echo -e "\nMEDIUM priority status:"
curl -s http://localhost:3000/api/v1/status/$INGESTION_ID_1 | json_pp

echo -e "\nHIGH priority status:"
curl -s http://localhost:3000/api/v1/status/$INGESTION_ID_2 | json_pp
