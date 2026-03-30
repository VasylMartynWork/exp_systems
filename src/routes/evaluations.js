import express from 'express';
import { EvaluationService } from '../services/EvaluationService.js';

const router = express.Router();

// Create a new evaluation
router.post('/', async (req, res) => {
  try {
    const { alternative_id, criterion_id, value } = req.body;
    const evaluation = await EvaluationService.create(alternative_id, criterion_id, value);
    res.status(201).json({
      success: true,
      data: evaluation,
      message: 'Evaluation created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all evaluations
router.get('/', async (req, res) => {
  try {
    const evaluations = await EvaluationService.getAll();
    res.json({
      success: true,
      data: evaluations,
      count: evaluations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get evaluation matrix
router.get('/matrix/all', async (req, res) => {
  try {
    const matrix = await EvaluationService.getMatrix();
    res.json({
      success: true,
      data: matrix,
      message: 'Evaluation matrix retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get evaluations for a specific alternative
router.get('/alternative/:alternativeId', async (req, res) => {
  try {
    const evaluations = await EvaluationService.getByAlternative(parseInt(req.params.alternativeId));
    res.json({
      success: true,
      data: evaluations,
      count: evaluations.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get evaluations for a specific criterion
router.get('/criterion/:criterionId', async (req, res) => {
  try {
    const evaluations = await EvaluationService.getByCriterion(parseInt(req.params.criterionId));
    res.json({
      success: true,
      data: evaluations,
      count: evaluations.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific evaluation
router.get('/:id', async (req, res) => {
  try {
    const evaluation = await EvaluationService.getById(parseInt(req.params.id));
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Get evaluation by alternative and criterion
router.get('/:alternativeId/:criterionId', async (req, res) => {
  try {
    const evaluation = await EvaluationService.getByAlternativeAndCriterion(
      parseInt(req.params.alternativeId),
      parseInt(req.params.criterionId)
    );
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Update an evaluation
router.put('/:id', async (req, res) => {
  try {
    const { value } = req.body;
    const evaluation = await EvaluationService.update(parseInt(req.params.id), value);
    res.json({
      success: true,
      data: evaluation,
      message: 'Evaluation updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update evaluation by alternative and criterion
router.put('/:alternativeId/:criterionId', async (req, res) => {
  try {
    const { value } = req.body;
    const evaluation = await EvaluationService.updateByAlternativeAndCriterion(
      parseInt(req.params.alternativeId),
      parseInt(req.params.criterionId),
      value
    );
    res.json({
      success: true,
      data: evaluation,
      message: 'Evaluation updated/created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete an evaluation
router.delete('/:id', async (req, res) => {
  try {
    const result = await EvaluationService.delete(parseInt(req.params.id));
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

// Delete evaluation by alternative and criterion
router.delete('/:alternativeId/:criterionId', async (req, res) => {
  try {
    const result = await EvaluationService.deleteByAlternativeAndCriterion(
      parseInt(req.params.alternativeId),
      parseInt(req.params.criterionId)
    );
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
