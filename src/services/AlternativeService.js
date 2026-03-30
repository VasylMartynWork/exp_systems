import { Alternative } from '../models/Alternative.js';

export class AlternativeService {
  static async create(name, description) {
    if (!name || name.trim() === '') {
      throw new Error('Alternative name is required');
    }
    
    const id = await Alternative.create(name.trim(), description || '');
    return await Alternative.getById(id);
  }

  static async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid alternative ID');
    }

    const alternative = await Alternative.getById(id);
    if (!alternative) {
      throw new Error(`Alternative with ID ${id} not found`);
    }
    return alternative;
  }

  static async getAll() {
    return await Alternative.getAll();
  }

  static async update(id, name, description) {
    const alternative = await this.getById(id);

    if (!name || name.trim() === '') {
      throw new Error('Alternative name is required');
    }

    const updated = await Alternative.update(id, name.trim(), description || '');
    if (!updated) {
      throw new Error('Failed to update alternative');
    }

    return await Alternative.getById(id);
  }

  static async delete(id) {
    const alternative = await this.getById(id);
    const deleted = await Alternative.delete(id);
    
    if (!deleted) {
      throw new Error('Failed to delete alternative');
    }

    return { message: 'Alternative deleted successfully', deleted: alternative };
  }
}
