const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

app.use(express.json());

// Load db.json into memory
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Utility to save changes back to db.json
function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// GET logs based on courseId and uvuId
app.get('/logs', (req, res) => {
  const { courseId, uvuId } = req.query;
  if (!courseId || !uvuId) {
    return res.status(400).send('courseId and uvuId are required');
  }
  const logs = db.logs.filter(log => log.courseId === courseId && log.uvuId === uvuId);
  res.json(logs);
});

// POST to add a new log
app.post('/logs', (req, res) => {
  const { courseId, uvuId, text, dateTime } = req.body;
  if (!courseId || !uvuId || !text || !dateTime) {
    return res.status(400).send('courseId, uvuId, text, and dateTime are required');
  }
  const newLog = {
    courseId,
    uvuId,
    text,
    dateTime,
    id: uuidv4() // Generate unique id for new log
  };
  db.logs.push(newLog);
  saveDb(); // Save changes to db.json
  res.status(201).json(newLog);
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1><p>The requested resource was not found on this server.</p>');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
