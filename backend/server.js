const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Walmart Assistant backend is running!');
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add your API routes here

app.get('/api/suppliers', (req, res) => {
  const suppliersPath = path.join(__dirname, 'suppliers.json');
  fs.readFile(suppliersPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load suppliers data' });
    }
    try {
      const suppliers = JSON.parse(data);
      res.json(suppliers);
    } catch (parseErr) {
      res.status(500).json({ error: 'Error parsing suppliers data' });
    }
  });
});

app.get('/api/tariffs', (req, res) => {
  const tariffsPath = path.join(__dirname, 'tariffs.json');
  fs.readFile(tariffsPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load tariffs data' });
    }
    try {
      const tariffs = JSON.parse(data);
      res.json(tariffs);
    } catch (parseErr) {
      res.status(500).json({ error: 'Error parsing tariffs data' });
    }
  });
});

app.get('/api/ports', (req, res) => {
  const portsPath = path.join(__dirname, 'ports.json');
  fs.readFile(portsPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load ports data' });
    }
    try {
      const ports = JSON.parse(data);
      res.json(ports);
    } catch (parseErr) {
      res.status(500).json({ error: 'Error parsing ports data' });
    }
  });
});

// User authentication endpoints
const usersPath = path.join(__dirname, 'users.json');

app.get('/api/users', (req, res) => {
  fs.readFile(usersPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load users' });
    try {
      const users = JSON.parse(data);
      res.json(users);
    } catch (parseErr) {
      res.status(500).json({ error: 'Error parsing users data' });
    }
  });
});

app.post('/api/users', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  fs.readFile(usersPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load users' });
    let users = [];
    try {
      users = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing users data' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    users.push({ email, password });
    fs.writeFile(usersPath, JSON.stringify(users, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Failed to save user' });
      res.status(201).json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 