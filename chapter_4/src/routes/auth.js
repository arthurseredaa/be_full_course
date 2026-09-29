import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {getNormalizedCredentials} from "../lib/get-normalized-credentials.js";
import {db} from "../prisma/db.ts";

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

    const userId = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User.create({
        email: credentials.email,
        password: hashedPassword,
      })

      await tx.orm.public.Todo.create({
        user_id: user.id,
        title: 'Initial todo',
        completed: false,
      })

      return user.id
    })

    const token = jwt.sign({
      id: userId,
      email: credentials.email
    }, process.env.JWT_SECRET, {expiresIn: '24h'});

    return res.status(201).send({token});
  } catch (error) {
    if (error.sqlState === '23505') {
      return res.status(409).send({
        error: 'User with that email already exists',
        code: error.sqlState,
      })
    }

    return res.status(500).send({
      error: error.message,
      code: error.sqlState,
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

    const user = await db.orm.public.User.where({email: credentials.email}).first();

    if (!user?.password) {
      return res.status(401).send({
        error: 'Email or password are invalid, please try again'
      })
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

    if (isPasswordValid) {
      const token = jwt.sign({
        id: user.id,
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
      code: error.sqlState,
    })
  }
})
