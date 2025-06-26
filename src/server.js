const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const faker = require('faker');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb-service:27017/statefulapp';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Define the data schema
const DataSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Data = mongoose.model('Data', DataSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    // Get limit and page from query parameters or use defaults
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const validLimits = [10, 20, 50, 100];
    
    // Fix: Convert number to int and then check if it's valid
    const safeLimit = validLimits.find(val => val === limit) || 10;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * safeLimit;
    
    // Get data with pagination
    const data = await Data.find()
                          .sort({ createdAt: -1 })
                          .skip(skip)
                          .limit(safeLimit);
    
    // Get total count for pagination
    const totalCount = await Data.countDocuments();
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / safeLimit);
    
    res.render('index', { 
      data: data,
      currentLimit: safeLimit,
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('index', { 
      data: [],
      currentLimit: 10,
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      error: 'Failed to fetch data'
    });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const data = await Data.find();
    res.render('stats', {
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('stats', {
      data: [],
      error: 'Failed to fetch data'
    });
  }
});

app.get('/generator', (req, res) => {
  res.render('generator');
});

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await Data.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get data by ID
app.get('/api/data/:id', async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Data not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new data
app.post('/api/data', async (req, res) => {
  try {
    const data = new Data({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    });
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate random data
app.post('/api/generate', async (req, res) => {
  try {
    const count = req.body.count || 10;
    const generatedData = [];
    
    for (let i = 0; i < count; i++) {
      const data = new Data({
        name: faker.name.findName(),
        email: faker.internet.email(),
        message: faker.lorem.paragraph()
      });
      await data.save();
      generatedData.push(data);
    }
    
    res.status(201).json({
      message: `Generated ${count} records successfully`,
      count: generatedData.length
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete data
app.delete('/api/data/:id', async (req, res) => {
  try {
    const data = await Data.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Data not found' });
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete multiple entries
app.post('/api/data/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No valid IDs provided' });
    }
    
    const result = await Data.deleteMany({ _id: { $in: ids } });
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} entries`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all entries
app.delete('/api/data', async (req, res) => {
  try {
    const result = await Data.deleteMany({});
    res.json({ 
      message: `Successfully deleted all ${result.deletedCount} entries`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


