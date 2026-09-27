import express from "express";

export const todoRoutes = express.Router();

todoRoutes.get('/', (req, res) => {});
todoRoutes.post('/', (req, res) => {});
todoRoutes.patch('/:id', (req, res) => {});
todoRoutes.delete('/:id', (req, res) => {});