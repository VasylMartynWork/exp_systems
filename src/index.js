import express from 'express';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/database.js';
import alternativesRouter from './routes/alternatives.js';
import criteriaRouter from './routes/criteria.js';
import evaluationsRouter from './routes/evaluations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/alternatives', alternativesRouter);
app.use('/api/criteria', criteriaRouter);
app.use('/api/evaluations', evaluationsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Decision Support System is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Decision Support System server is running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT}/health to check status`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
