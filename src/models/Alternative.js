import { getDatabase, run, get, all } from '../db/database.js';

export class Alternative {
  static async create(name, description = '') {
    const db = getDatabase();
    const result = await run(db, 
      'INSERT INTO alternatives (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.lastID;
  }

  static async getById(id) {
    const db = getDatabase();
    return await get(db, 'SELECT * FROM alternatives WHERE id = ?', [id]);
  }

  static async getAll() {
    const db = getDatabase();
    return await all(db, 'SELECT * FROM alternatives ORDER BY created_at DESC');
  }

  static async update(id, name, description) {
    const db = getDatabase();
    const result = await run(db,
      'UPDATE alternatives SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result.changes > 0;
  }

  static async delete(id) {
    const db = getDatabase();
    const result = await run(db, 'DELETE FROM alternatives WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async exists(id) {
    const db = getDatabase();
    const row = await get(db, 'SELECT id FROM alternatives WHERE id = ?', [id]);
    return !!row;
  }
}
