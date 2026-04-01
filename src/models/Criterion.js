import { getDatabase, run, get, all } from '../db/database.js';

export class Criterion {
  static async create(name, type, description = '') {
    if (!['maximize', 'minimize'].includes(type)) {
      throw new Error('Type must be either "maximize" or "minimize"');
    }

    const db = getDatabase();
    const result = await run(db,
      'INSERT INTO criteria (name, type, description) VALUES (?, ?, ?)',
      [name, type, description]
    );
    return result.lastID;
  }

  static async getById(id) {
    const db = getDatabase();
    return await get(db, 'SELECT * FROM criteria WHERE id = ?', [id]);
  }

  static async getAll() {
    const db = getDatabase();
    return await all(db, 'SELECT * FROM criteria ORDER BY created_at DESC');
  }

  static async update(id, name, type, description) {
    if (!['maximize', 'minimize'].includes(type)) {
      throw new Error('Type must be either "maximize" or "minimize"');
    }

    const db = getDatabase();
    const result = await run(db,
      'UPDATE criteria SET name = ?, type = ?, description = ? WHERE id = ?',
      [name, type, description, id]
    );
    return result.changes > 0;
  }

  static async delete(id) {
    const db = getDatabase();
    const result = await run(db, 'DELETE FROM criteria WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async exists(id) {
    const db = getDatabase();
    const row = await get(db, 'SELECT id FROM criteria WHERE id = ?', [id]);
    return !!row;
  }

  static async setWeight(id, weight) {
    const db = getDatabase();
    const result = await run(db,
      'UPDATE criteria SET weight = ? WHERE id = ?',
      [weight, id]
    );
    return result.changes > 0;
  }

  static async getWeight(id) {
    const db = getDatabase();
    const row = await get(db, 'SELECT weight FROM criteria WHERE id = ?', [id]);
    return row ? row.weight : null;
  }

  static async getAllWeights() {
    const db = getDatabase();
    const rows = await all(db, 'SELECT id, name, weight FROM criteria ORDER BY id');
    const weights = {};
    rows.forEach(row => {
      weights[row.id] = row.weight;
    });
    return { data: rows, weights };
  }

  static async normalizeWeights() {
    const db = getDatabase();
    const rows = await all(db, 'SELECT id, weight FROM criteria WHERE weight > 0');
    
    if (rows.length === 0) return false;

    const sum = rows.reduce((acc, row) => acc + row.weight, 0);
    
    if (sum === 0) return false;

    for (const row of rows) {
      const normalizedWeight = row.weight / sum;
      await run(db, 'UPDATE criteria SET weight = ? WHERE id = ?', [normalizedWeight, row.id]);
    }

    return true;
  }
}
