import { Evaluation } from '../models/Evaluation.js';
import { AlternativeService } from './AlternativeService.js';
import { CriterionService } from './CriterionService.js';

export class EvaluationService {
  static async create(alternativeId, criterionId, value) {
    if (!alternativeId || isNaN(alternativeId)) {
      throw new Error('Invalid alternative ID');
    }

    if (!criterionId || isNaN(criterionId)) {
      throw new Error('Invalid criterion ID');
    }

    if (value === null || value === undefined || isNaN(value)) {
      throw new Error('Evaluation value is required and must be a number');
    }

    // Validate that alternative and criterion exist
    await AlternativeService.getById(alternativeId);
    await CriterionService.getById(criterionId);

    const id = await Evaluation.create(alternativeId, criterionId, value);
    return await Evaluation.getById(id);
  }

  static async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid evaluation ID');
    }

    const evaluation = await Evaluation.getById(id);
    if (!evaluation) {
      throw new Error(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  static async getByAlternativeAndCriterion(alternativeId, criterionId) {
    if (!alternativeId || isNaN(alternativeId)) {
      throw new Error('Invalid alternative ID');
    }

    if (!criterionId || isNaN(criterionId)) {
      throw new Error('Invalid criterion ID');
    }

    const evaluation = await Evaluation.getByAlternativeAndCriterion(alternativeId, criterionId);
    if (!evaluation) {
      throw new Error(`Evaluation for alternative ${alternativeId} and criterion ${criterionId} not found`);
    }
    return evaluation;
  }

  static async getAll() {
    return await Evaluation.getAll();
  }

  static async getByAlternative(alternativeId) {
    await AlternativeService.getById(alternativeId);
    return await Evaluation.getByAlternative(alternativeId);
  }

  static async getByCriterion(criterionId) {
    await CriterionService.getById(criterionId);
    return await Evaluation.getByCriterion(criterionId);
  }

  static async getMatrix() {
    const matrix = await Evaluation.getMatrix();
    
    // Format matrix data
    const alternatives = new Map();
    const criteria = new Map();

    matrix.forEach(row => {
      if (!alternatives.has(row.alternative_id)) {
        alternatives.set(row.alternative_id, {
          id: row.alternative_id,
          name: row.alternative_name
        });
      }

      if (!criteria.has(row.criterion_id)) {
        criteria.set(row.criterion_id, {
          id: row.criterion_id,
          name: row.criterion_name,
          type: row.criterion_type
        });
      }
    });

    // Build evaluation matrix
    const evaluationMatrix = {};
    matrix.forEach(row => {
      const key = `${row.alternative_id}_${row.criterion_id}`;
      evaluationMatrix[key] = row.value;
    });

    return {
      alternatives: Array.from(alternatives.values()),
      criteria: Array.from(criteria.values()),
      evaluations: evaluationMatrix,
      rawData: matrix
    };
  }

  static async update(id, value) {
    await this.getById(id);

    if (value === null || value === undefined || isNaN(value)) {
      throw new Error('Evaluation value is required and must be a number');
    }

    const updated = await Evaluation.update(id, value);
    if (!updated) {
      throw new Error('Failed to update evaluation');
    }

    return await Evaluation.getById(id);
  }

  static async updateByAlternativeAndCriterion(alternativeId, criterionId, value) {
    await AlternativeService.getById(alternativeId);
    await CriterionService.getById(criterionId);

    if (value === null || value === undefined || isNaN(value)) {
      throw new Error('Evaluation value is required and must be a number');
    }

    // Try to update existing evaluation
    let updated = await Evaluation.updateByAlternativeAndCriterion(alternativeId, criterionId, value);
    
    if (!updated) {
      // If update returned 0 changes, create new evaluation
      const id = await Evaluation.create(alternativeId, criterionId, value);
      return await Evaluation.getById(id);
    }

    return await Evaluation.getByAlternativeAndCriterion(alternativeId, criterionId);
  }

  static async delete(id) {
    const evaluation = await this.getById(id);
    const deleted = await Evaluation.delete(id);
    
    if (!deleted) {
      throw new Error('Failed to delete evaluation');
    }

    return { message: 'Evaluation deleted successfully', deleted: evaluation };
  }

  static async deleteByAlternativeAndCriterion(alternativeId, criterionId) {
    const evaluation = await Evaluation.getByAlternativeAndCriterion(alternativeId, criterionId);
    const deleted = await Evaluation.deleteByAlternativeAndCriterion(alternativeId, criterionId);
    
    if (!deleted) {
      throw new Error('Failed to delete evaluation');
    }

    return { message: 'Evaluation deleted successfully', deleted: evaluation };
  }
}
