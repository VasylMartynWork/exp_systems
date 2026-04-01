import { Criterion } from '../models/Criterion.js';

export class CriterionService {
  static async create(name, type, description) {
    if (!name || name.trim() === '') {
      throw new Error('Criterion name is required');
    }

    if (!['maximize', 'minimize'].includes(type)) {
      throw new Error('Type must be either "maximize" or "minimize"');
    }

    const id = await Criterion.create(name.trim(), type, description || '');
    return await Criterion.getById(id);
  }

  static async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid criterion ID');
    }

    const criterion = await Criterion.getById(id);
    if (!criterion) {
      throw new Error(`Criterion with ID ${id} not found`);
    }
    return criterion;
  }

  static async getAll() {
    return await Criterion.getAll();
  }

  static async update(id, name, type, description) {
    const criterion = await this.getById(id);

    if (!name || name.trim() === '') {
      throw new Error('Criterion name is required');
    }

    if (!['maximize', 'minimize'].includes(type)) {
      throw new Error('Type must be either "maximize" or "minimize"');
    }

    const updated = await Criterion.update(id, name.trim(), type, description || '');
    if (!updated) {
      throw new Error('Failed to update criterion');
    }

    return await Criterion.getById(id);
  }

  static async delete(id) {
    const criterion = await this.getById(id);
    const deleted = await Criterion.delete(id);
    
    if (!deleted) {
      throw new Error('Failed to delete criterion');
    }

    return { message: 'Criterion deleted successfully', deleted: criterion };
  }

  static async setWeight(id, weight) {
    const criterion = await this.getById(id);

    if (weight === null || weight === undefined || isNaN(weight)) {
      throw new Error('Weight must be a number');
    }

    if (weight < 0) {
      throw new Error('Weight cannot be negative');
    }

    const updated = await Criterion.setWeight(id, weight);
    if (!updated) {
      throw new Error('Failed to set weight');
    }

    return await Criterion.getById(id);
  }

  static async getWeight(id) {
    const criterion = await this.getById(id);
    return await Criterion.getWeight(id);
  }

  static async getAllWeights() {
    return await Criterion.getAllWeights();
  }

  static async normalizeWeights() {
    const normalized = await Criterion.normalizeWeights();
    if (!normalized) {
      throw new Error('No criteria with positive weights found. Set weights before normalizing.');
    }

    const weights = await Criterion.getAllWeights();
    return { message: 'Weights normalized successfully', weights: weights.data };
  }
}
