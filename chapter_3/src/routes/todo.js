import express from "express";
import {db} from "../db/index.js";

export const todoRoutes = express.Router();

todoRoutes.get('/', (req, res) => {
  if (!req.user_id) {
    return res.status(400).send('User id is required');
  }

  try {
    const readTodos = db.prepare("SELECT * FROM todos WHERE user_id=$user_id");
    const row = readTodos.all({user_id: req.user_id});

    if (!row) {
      return res.status(404).send('No todos found');
    }

    res.status(200).send(row);
  } catch (error) {
    console.error(error)
    return res.status(404).send('No todos found');
  }
});
todoRoutes.post('/', (req, res) => {
});
todoRoutes.patch('/:id', (req, res) => {
});
todoRoutes.delete('/:id', (req, res) => {
});