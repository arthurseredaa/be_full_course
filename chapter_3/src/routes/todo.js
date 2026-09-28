import express from "express";
import {db} from "../db/index.js";

export const todoRoutes = express.Router();

todoRoutes.get('/', (req, res) => {
  try {
    const readTodos = db.prepare("SELECT * FROM todos WHERE user_id=$user_id");
    const row = readTodos.all({user_id: req.user_id});

    res.status(200).send(row);
  } catch (error) {
    return res.status(500).send({
      error: 'Failed to get todos',
    });
  }
});

todoRoutes.post('/', (req, res) => {
  try {
    const title = req.body?.title;

    if (!title) {
      return res.status(400).send('Field title is required');
    }

    const insertTodo = db.prepare("INSERT INTO todos (user_id, title, completed) VALUES ($user_id, $title, $completed) RETURNING *");
    const row = insertTodo.get({user_id: req.user_id, title, completed: 0});

    res.status(201).send(row)
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Failed to insert new todo'
    })
  }
});

todoRoutes.patch('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id in request parameters');
    }

    if (typeof req.body.completed !== 'number') {
      return res.status(400).send('Field completed must be a number');
    }

    const updateTodo = db.prepare("UPDATE todos SET completed = $completed WHERE id = $id AND user_id=$user_id");
    const row = updateTodo.run({id, user_id: req.user_id, completed: req.body.completed});

    if (row.changes) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: `Failed to update todo with id: ${req.params.id}`,
    })
  }
});

todoRoutes.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id in request parameters');
    }

    const deleteTodo = db.prepare("DELETE FROM todos WHERE id = $id AND user_id=$user_id");
    const row = deleteTodo.run({id, user_id: req.user_id});

    if (row.changes) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: `Unable to delete todo with id: ${req.params.id}`,
    })
  }
});