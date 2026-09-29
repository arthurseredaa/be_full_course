import express from "express";
import {db} from "../prisma/db.ts";

export const todoRoutes = express.Router();

todoRoutes.get('/', async (req, res) => {
  try {
    const todos = await db.orm.public.Todo.where({user_id: req.user_id}).all();

    res.status(200).send(todos);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Failed to get todos',
    });
  }
});

todoRoutes.post('/', async (req, res) => {
  try {
    const title = req.body?.title;

    if (!title) {
      return res.status(400).send('Field title is required');
    }

    const todo = await db.orm.public.Todo.create({
      user_id: req.user_id,
      title,
      completed: false,
    })

    res.status(201).send(todo)
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Failed to insert new todo'
    })
  }
});

todoRoutes.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id in request parameters');
    }

    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).send('Field completed must be a boolean');
    }

    const todo = await db.orm.public.Todo.where({user_id: req.user_id, id}).update({completed: req.body.completed});

    if (!todo) {
      return res.status(404).send('No todos found');
    } else {
      return res.status(200).send(todo);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: `Failed to update todo with id: ${req.params.id}`,
    })
  }
});

todoRoutes.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id in request parameters');
    }

    const todo = await db.orm.public.Todo.where({id: id, user_id: req.user_id}).delete();

    if (!todo) {
      return res.status(404).send('No todos found');
    } else {
      return res.status(200).send(todo);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: `Unable to delete todo with id: ${req.params.id}`,
    })
  }
});