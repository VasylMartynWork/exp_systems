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
}
