import { getDatabase, run, get, all } from '../db/database.js';

export class Evaluation {
  static async create(alternativeId, criterionId, value) {
    const db = getDatabase();
    const result = await run(db,
      'INSERT INTO evaluations (alternative_id, criterion_id, value) VALUES (?, ?, ?)',
      [alternativeId, criterionId, value]
    );
    return result.lastID;
  }

  static async getById(id) {
    const db = getDatabase();
    return await get(db, 'SELECT * FROM evaluations WHERE id = ?', [id]);
  }

  static async getByAlternativeAndCriterion(alternativeId, criterionId) {
    const db = getDatabase();
    return await get(db,
      'SELECT * FROM evaluations WHERE alternative_id = ? AND criterion_id = ?',
      [alternativeId, criterionId]
    );
  }

  static async getAll() {
    const db = getDatabase();
    return await all(db, 'SELECT * FROM evaluations ORDER BY created_at DESC');
  }

  static async getByAlternative(alternativeId) {
    const db = getDatabase();
    return await all(db,
      'SELECT * FROM evaluations WHERE alternative_id = ? ORDER BY criterion_id',
      [alternativeId]
    );
  }

  static async getByCriterion(criterionId) {
    const db = getDatabase();
    return await all(db,
      'SELECT * FROM evaluations WHERE criterion_id = ? ORDER BY alternative_id',
      [criterionId]
    );
  }

  static async getMatrix() {
    const db = getDatabase();
    return await all(db, `
      SELECT
        a.id as alternative_id,
        a.name as alternative_name,
        c.id as criterion_id,
        c.name as criterion_name,
        c.type as criterion_type,
        e.value
      FROM alternatives a
      CROSS JOIN criteria c
      LEFT JOIN evaluations e ON a.id = e.alternative_id AND c.id = e.criterion_id
      ORDER BY a.id, c.id
    `);
  }

  static async update(id, value) {
    const db = getDatabase();
    const result = await run(db,
      'UPDATE evaluations SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [value, id]
    );
    return result.changes > 0;
  }

  static async updateByAlternativeAndCriterion(alternativeId, criterionId, value) {
    const db = getDatabase();
    const result = await run(db,
      'UPDATE evaluations SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE alternative_id = ? AND criterion_id = ?',
      [value, alternativeId, criterionId]
    );
    return result.changes > 0;
  }

  static async delete(id) {
    const db = getDatabase();
    const result = await run(db, 'DELETE FROM evaluations WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async deleteByAlternativeAndCriterion(alternativeId, criterionId) {
    const db = getDatabase();
    const result = await run(db,
      'DELETE FROM evaluations WHERE alternative_id = ? AND criterion_id = ?',
      [alternativeId, criterionId]
    );
    return result.changes > 0;
  }
}
