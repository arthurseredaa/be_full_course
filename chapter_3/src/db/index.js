import {DatabaseSync} from 'node:sqlite';
import path from "path";
import {__dirname} from '../constants.js'

export const db = new DatabaseSync(path.join(__dirname, '/db/db.sqlite'));

db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        email    TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS todos
    (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id   INTEGER,
        title     TEXT    NOT NULL,
        completed INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
`)
