import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {db} from "../db/index.js";
import {getNormalizedCredentials} from "../lib/get-normalized-credentials.js";
import {withTransaction} from "../lib/with-transaction.js";

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


    const userId = withTransaction(() => {
      const insertUser = db.prepare(`
          INSERT INTO users(email, password)
          VALUES ($email, $password)
      `);

      const userResult = insertUser.run({email: credentials.email, password: hashedPassword})

      const insertTodo = db.prepare(`
          INSERT INTO todos(user_id, title, completed)
          VALUES ($user_id, $title, $completed)
      `);

      insertTodo.run({user_id: userResult.lastInsertRowid, title: 'Initial todo', completed: 0})

      return userResult.lastInsertRowid
    })

    const token = jwt.sign({
      id: userId,
      email: credentials.email
    }, process.env.JWT_SECRET, {expiresIn: '24h'});

    return res.status(201).send({token});
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

    const getPassword = db.prepare(`
        SELECT password, id
        FROM users
        WHERE email = $email
    `)
    const result = getPassword.get({email: credentials.email})

    if (!result?.password) {
      return res.status(401).send({
        error: 'Email or password are invalid, please try again'
      })
    }

    const isCorrectPassword = await bcrypt.compare(credentials.password, result.password)

    if (isCorrectPassword) {
      const token = jwt.sign({
        id: result.id,
        email: credentials.email
      }, process.env.JWT_SECRET, {expiresIn: '24h'});

      return res.status(200).send({token});
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
