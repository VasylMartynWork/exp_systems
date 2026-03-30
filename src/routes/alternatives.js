import express from 'express';
import { AlternativeService } from '../services/AlternativeService.js';

const router = express.Router();

// Create a new alternative
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const alternative = await AlternativeService.create(name, description);
    res.status(201).json({
      success: true,
      data: alternative,
      message: 'Alternative created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all alternatives
router.get('/', async (req, res) => {
  try {
    const alternatives = await AlternativeService.getAll();
    res.json({
      success: true,
      data: alternatives,
      count: alternatives.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific alternative
router.get('/:id', async (req, res) => {
  try {
    const alternative = await AlternativeService.getById(parseInt(req.params.id));
    res.json({
      success: true,
      data: alternative
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Update an alternative
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const alternative = await AlternativeService.update(parseInt(req.params.id), name, description);
    res.json({
      success: true,
      data: alternative,
      message: 'Alternative updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete an alternative
router.delete('/:id', async (req, res) => {
  try {
    const result = await AlternativeService.delete(parseInt(req.params.id));
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

export default router;
