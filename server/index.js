import { createVertexClient } from './client.js';
import { createApp } from './app.js';
import { createGenerateContentFn } from './generator.js';
import dotenv from 'dotenv';

// Load local environment variables for development.
// In production, GOOGLE_CLOUD_PROJECT is supplied by deployment configuration;
// the attached Cloud Run service account provides ADC authentication credentials.
dotenv.config();

let ai;
try {
  ai = createVertexClient();
} catch (error) {
  // Fail fast: Log the error and exit before starting the web server.
  console.error(`Startup Failure: ${error.message}`);
  process.exit(1);
}

const generateContentFn = createGenerateContentFn(ai);

// Instantiate and start Express application
const app = createApp({ generateContentFn });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
