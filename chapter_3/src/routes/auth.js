import express from "express";
import bcrypt from 'bcryptjs';
import {db} from "../db/index.js";
import {getNormalizedCredentials} from "../lib/get-normalized-credentials.js";

export const authRoutes = express.Router();

authRoutes.post('/register', async (req, res) => {
  try {
    const credentials = getNormalizedCredentials(req.body);

    if (!credentials) {
      return res.status(400).send({
        error: 'Invalid Credentials',
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(credentials.password, salt);

    const row = db.prepare(`
        INSERT INTO users(email, password)
        VALUES ($email, $password)
    `).run({email: credentials.email, password: hashedPassword})

    if (row?.changes) {
      return res.sendStatus(201)
    }
  } catch (error) {
    if (error.errcode === 2067) {
      return res.status(409).send({
        error: 'User with that email already exists',
        code: error.errcode,
      })
    }

    return res.status(500).send({
      error: error.message,
      code: error.errcode,
    })
  }
})

authRoutes.post('/login', async (req, res) => {
  try {
    const credentials = getNormalizedCredentials(req.body);

    if (!credentials) {
      return res.status(400).send({
        error: 'Invalid Credentials',
      })
    }

    const row = db.prepare(`
        SELECT password
        FROM users
        WHERE email = $email
    `).get({email: credentials.email})

    if (!row?.password) {
      return res.status(401).send({
        error: 'Email or password are invalid, please try again'
      })
    }

    const isCorrectPassword = await bcrypt.compare(credentials.password, row.password)

    if (isCorrectPassword) {
      return res.sendStatus(200)
    } else {
      return res.status(401).send({
        error: 'Email or password are invalid, please try again'
      })
    }
  } catch (error) {
    return res.status(500).send({
      error: error.message,
      code: error.errcode,
    })
  }
})
