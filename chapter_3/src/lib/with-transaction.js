import {db} from "../db/index.js";

export const withTransaction = (cb) => {
  try {
    db.exec('BEGIN');
    const payload = cb();
    db.exec('COMMIT');

    return payload;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}