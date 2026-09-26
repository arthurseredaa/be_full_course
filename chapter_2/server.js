const express = require('express');

const app = express();
app.use(express.json());

const PORT = 3000;

let data = [
    {name: 'Arthur', age: 30},
]

// HTML endpoints
app.get('/', (req, res) => {
    res.send('<h1>Homepage</h1><input />');
})

app.get('/dashboard', (req, res) => {
    res.send('<h1>Dashboard</h1><input />');
})

// API endpoints
app.get('/api/data', (req, res) => {
    res.send(`
    <h1>Data</h1>
    <p>${JSON.stringify(data)}</p>
`)
})

app.post('/api/data', (req, res) => {
    const entry = req.body;

    data.push(entry);

    res.sendStatus(201)
})

app.delete('/api/data', (req, res) => {
    const entryName = req.body.name

    data = data.filter((item) => item.name !== entryName);
    res.sendStatus(203);
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})