import express from 'express';
import { CriterionService } from '../services/CriterionService.js';

const router = express.Router();

// Create a new criterion
router.post('/', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const criterion = await CriterionService.create(name, type, description);
    res.status(201).json({
      success: true,
      data: criterion,
      message: 'Criterion created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all criteria
router.get('/', async (req, res) => {
  try {
    const criteria = await CriterionService.getAll();
    res.json({
      success: true,
      data: criteria,
      count: criteria.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific criterion
router.get('/:id', async (req, res) => {
  try {
    const criterion = await CriterionService.getById(parseInt(req.params.id));
    res.json({
      success: true,
      data: criterion
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Update a criterion
router.put('/:id', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const criterion = await CriterionService.update(parseInt(req.params.id), name, type, description);
    res.json({
      success: true,
      data: criterion,
      message: 'Criterion updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a criterion
router.delete('/:id', async (req, res) => {
  try {
    const result = await CriterionService.delete(parseInt(req.params.id));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Get all weights
router.get('/weights/all', async (req, res) => {
  try {
    const result = await CriterionService.getAllWeights();
    res.json({
      success: true,
      data: result.data,
      weights: result.weights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Set weight for a criterion
router.put('/:id/weight', async (req, res) => {
  try {
    const { weight } = req.body;
    const criterion = await CriterionService.setWeight(parseInt(req.params.id), weight);
    res.json({
      success: true,
      data: criterion,
      message: 'Criterion weight set successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Normalize weights (make them sum to 1.0)
router.post('/weights/normalize', async (req, res) => {
  try {
    const result = await CriterionService.normalizeWeights();
    res.json({
      success: true,
      data: result.weights,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
