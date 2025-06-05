# LoopAI

A robust TypeScript-based REST API for batch job processing with priority queues and rate limiting.

## Features

- **Priority Queue System**: Support for HIGH, MEDIUM, and LOW priority job processing
- **Batch Processing**: Automatically processes IDs in batches of 3
- **Rate Limiting**:
  - Global rate limit: 100 requests per 15 minutes per IP
  - Batch processing rate limit: 5 seconds between batches
- **Status Tracking**: Real-time status updates for each ingestion request and batch
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Logging**: Detailed logging system using Winston
- **Input Validation**: Request validation using Zod schema
- **Type Safety**: Written in TypeScript for better type safety and development experience

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/loopai.git
cd loopai
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
PORT=3000
NODE_ENV=development
```

Note: CORS is configured to allow all origins by default, so no CORS configuration is needed in the environment variables.

5. Build the project:

```bash
npm run build
```

6. Start the server:

```bash
# For production
npm start

# For development (with hot reload)
npm run dev
```

## API Documentation

### 1. Ingest Data Endpoint

**POST** `/api/v1/ingest`

Submit IDs for processing with specified priority.

**Request Body:**

```json
{
  "ids": number[],      // Array of integers between 1 and 10^9+7
  "priority": string    // "HIGH" | "MEDIUM" | "LOW"
}
```

**Example:**

```json
{
  "ids": [1, 2, 3, 4, 5],
  "priority": "HIGH"
}
```

**Response:** (202 Accepted)

```json
{
  "ingestion_id": "f7s8df6s8d7f"
}
```

### 2. Check Status Endpoint

**GET** `/api/v1/status/:ingestionId`

Check the status of a submitted job.

**Response:**

```json
{
  "ingestion_id": "f7s8df6s8d7f",
  "status": "completed", // "yet_to_start" | "triggered" | "completed"
  "batches": [
    {
      "batch_id": "b1",
      "ids": [1, 2, 3],
      "status": "completed"
    },
    {
      "batch_id": "b2",
      "ids": [4, 5],
      "status": "completed"
    }
  ]
}
```

## Rate Limiting Details

1. **Global Rate Limit**

   - 100 requests per 15 minutes per IP address
   - Applies to all endpoints
   - Returns 429 status code when limit exceeded

2. **Batch Processing Rate Limit**
   - 5-second cooldown between processing batches
   - Ensures system stability and resource management

## Job Processing System

1. **Priority Levels**

   - HIGH: Processed first
   - MEDIUM: Processed after HIGH priority jobs
   - LOW: Processed after MEDIUM priority jobs

2. **Batch Processing**

   - IDs are processed in batches of 3
   - Last batch may contain fewer IDs
   - Each batch goes through states: yet_to_start → triggered → completed

3. **Queue Management**
   - Jobs are processed in order of priority
   - Within same priority, FIFO order is maintained
   - Singleton pattern ensures single queue instance

## Error Handling

The API implements comprehensive error handling:

- 400: Bad Request (Invalid input)
- 404: Not Found (Invalid ingestion ID)
- 429: Too Many Requests (Rate limit exceeded)
- 500: Internal Server Error

## Testing

You can test the API using the provided shell script:

```bash
chmod +x test_api.sh
./test_api.sh
```

## Development

```bash
# Start in development mode (with hot reload)
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── app.ts              # Application entry point
├── config/            # Configuration files
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
├── routes/           # API routes
├── schemas/          # Validation schemas
├── services/         # Business logic
└── utils/            # Utility functions
```

## Security

The API implements several security measures:

- Helmet for HTTP headers security
- CORS configured to allow all origins (\*)
- Cross-Origin Resource Sharing (CORS) with credentials support
- Rate limiting to prevent abuse
- Input validation for all requests

## Logging

Winston logger is configured to:

- Log all requests and responses
- Store errors in error.log
- Store all logs in combined.log
- Console logging in development mode

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
