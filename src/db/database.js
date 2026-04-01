import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_PATH = process.env.DATABASE_PATH || './data/dss.db';
const DB_FULL_PATH = path.resolve(DATABASE_PATH);
const DB_DIR = path.dirname(DB_FULL_PATH);

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

// Initialize database connection
export const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(DB_FULL_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
      }
    });
  }
  return db;
};

// Promisify database methods
const run = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Export database operations
export { run, get, all };

// Initialize database schema
export const initializeDatabase = async () => {
  const database = getDatabase();

  const createAlternativesTable = () => {
    return new Promise((resolve, reject) => {
      database.run(`
        CREATE TABLE IF NOT EXISTS alternatives (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  const createCriteriaTable = () => {
    return new Promise((resolve, reject) => {
      database.run(`
        CREATE TABLE IF NOT EXISTS criteria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL CHECK(type IN ('maximize', 'minimize')),
          description TEXT,
          weight REAL DEFAULT 0.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  const migrateSchema = () => {
    return new Promise((resolve, reject) => {
      // Check if weight column exists in criteria table
      database.all("PRAGMA table_info(criteria)", (err, columns) => {
        if (err) {
          reject(err);
          return;
        }

        const hasWeight = columns && columns.some(col => col.name === 'weight');
        
        if (hasWeight) {
          resolve();
        } else {
          // Add weight column if it doesn't exist
          database.run(`ALTER TABLE criteria ADD COLUMN weight REAL DEFAULT 0.0`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  };

  const createEvaluationsTable = () => {
    return new Promise((resolve, reject) => {
      database.run(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          alternative_id INTEGER NOT NULL,
          criterion_id INTEGER NOT NULL,
          value REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(alternative_id) REFERENCES alternatives(id) ON DELETE CASCADE,
          FOREIGN KEY(criterion_id) REFERENCES criteria(id) ON DELETE CASCADE,
          UNIQUE(alternative_id, criterion_id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  try {
    await Promise.all([
      createAlternativesTable(),
      createCriteriaTable(),
      createEvaluationsTable()
    ]);
    console.log('Database tables created/verified');
    
    // Run migrations
    await migrateSchema();
    console.log('Database schema migrated');
  } catch (error) {
    throw new Error(`Database initialization failed: ${error.message}`);
  }
};

// Close database connection
export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
};
