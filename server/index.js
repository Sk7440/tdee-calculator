import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:4321';

// ─── Load config ────────────────────────────────────────────────────
const configPath = join(__dirname, 'config.json');
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, 'utf-8'))
  : {};

const MODEL_NAME = config.model || 'gemini-3.5-flash';
const SYSTEM_INSTRUCTION = config.systemInstructions || '';
const TEMPERATURE = config.temperature ?? 0.7;
const MAX_OUTPUT_TOKENS = config.maxOutputTokens || 8192;

// ─── Validate API key ───────────────────────────────────────────────
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.error('❌ GEMINI_API_KEY is not set or is still the placeholder.');
  console.error('   Edit server/.env and set your real API key from https://aistudio.google.com/apikey');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '20mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs || 60000,
  max: config.rateLimitMax || 30,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/chat', limiter);

// ─── POST /api/chat ─────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Convert messages to Gemini format
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.parts || [{ text: msg.text || msg.content || '' }],
    }));

    // Build the model with system instruction
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    });

    // Stream the response
    const result = await model.generateContentStream({ contents });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Accel-Buffering', 'no');

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (err) {
    console.error('Gemini API error:', err);
    const message = err.message || '';

    if (message.includes('API_KEY') || message.includes('API key')) {
      res.status(401).json({ error: 'Invalid API key. Check your GEMINI_API_KEY in server/.env' });
    } else if (message.includes('not found') || message.includes('not supported')) {
      res.status(400).json({ error: `Model "${MODEL_NAME}" is not available. Check server/config.json` });
    } else if (message.includes('SAFETY')) {
      res.status(400).json({ error: 'Content blocked by safety filters. Please rephrase.' });
    } else if (err.status === 429) {
      res.status(429).json({ error: 'API rate limit reached. Try again shortly.' });
    } else {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
});

// ─── Health check ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: MODEL_NAME });
});

// ─── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 TDEE Lab Chat Server running on http://localhost:${PORT}`);
  console.log(`📋 Model: ${MODEL_NAME}`);
  console.log(`🔗 Allowed origin: ${ALLOWED_ORIGIN}`);
});
