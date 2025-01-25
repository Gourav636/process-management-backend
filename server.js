const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const port = 3000;

const recordsFile = path.join(__dirname, 'records.json'); // Path to the JSON file

app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Function to read the records from the JSON file
function readRecords() {
  if (fs.existsSync(recordsFile)) {
    try {
      const data = fs.readFileSync(recordsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading the file:", error);
      return [];
    }
  } else {
    // Ensure the file exists and is empty if not found
    fs.writeFileSync(recordsFile, JSON.stringify([]), 'utf-8');
    return []; // Return an empty array if the file doesn't exist
  }
}

// Function to save records to the JSON file
function saveRecords(records) {
  try {
    fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving records:", error);
  }
}

// Endpoint to fetch all saved records
app.get('/records', (req, res) => {
  const records = readRecords();
  res.status(200).json(records);
});

// Endpoint to fetch a record by ID
app.get('/records/:id', (req, res) => {
  const { id } = req.params;
  const records = readRecords();
  const record = records.find(record => record.id === parseInt(id));
  if (record) {
    res.status(200).json(record);
  } else {
    res.status(404).send({ message: 'Record not found' });
  }
});

// Endpoint to update an existing record
app.put('/records/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, status } = req.body;
  const records = readRecords();
  const index = records.findIndex((record) => record.id === parseInt(id)); // Ensure ID is treated as a number
  
  if (index !== -1) {
    records[index] = { 
      id: parseInt(id), 
      title, 
      description, 
      startDate: new Date(startDate), // Convert string to Date object
      endDate: new Date(endDate),     // Convert string to Date object
      status 
    };
    saveRecords(records);
    res.status(200).send({ message: 'Record updated successfully' });
  } else {
    res.status(404).send({ message: 'Record not found' });
  }
});

// Endpoint to save a new record
app.post('/save', (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  // Validate input
  if (!title || !description || !startDate || !endDate || !status) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  const records = readRecords();

  // Auto-generate ID by using the next highest number
  const newId = records.length > 0 ? Math.max(...records.map((record) => record.id)) + 1 : 1;

  const newRecord = {
    id: newId,
    title,
    description,
    startDate: new Date(startDate), // Convert string to Date object
    endDate: new Date(endDate),     // Convert string to Date object
    status,
  };

  records.push(newRecord);
  saveRecords(records);  // Save the updated list of records to the file
  res.status(200).send({ message: 'Record saved successfully' });
});

// Server listening
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
