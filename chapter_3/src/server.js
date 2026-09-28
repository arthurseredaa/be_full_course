import express from 'express';
import path from 'path';
import {__dirname} from "./constants.js";
import {authRoutes} from "./routes/auth.js";
import {todoRoutes} from "./routes/todo.js";
import {authMiddleware} from "./middleware/auth.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.status(200).sendFile('index.html');
})

// Routes
app.use('/auth', authRoutes);
app.use('/todos', authMiddleware, todoRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})