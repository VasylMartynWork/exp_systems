import express from 'express';
import { DecisionService } from '../services/DecisionService.js';

const router = express.Router();

// Calculate decision
router.post('/calculate', async (req, res) => {
  try {
    const { algorithm } = req.body;
    const result = await DecisionService.calculateDecision(algorithm || 'weighted_sum');
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get evaluation matrix
router.get('/matrix', async (req, res) => {
  try {
    const matrix = await DecisionService.getEvaluationMatrix();
    res.json({
      success: true,
      data: matrix
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get supported algorithms
router.get('/algorithms', (req, res) => {
  try {
    const algorithms = DecisionService.getSupportedAlgorithms();
    res.json({
      success: true,
      data: algorithms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
