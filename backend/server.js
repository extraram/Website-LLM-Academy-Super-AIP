import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  city: String,
  role: String,
  program: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Try MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ilm_academy';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection warning (falling back to JSON store):', err.message));

// API Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, city, role, program, message } = req.body;
    
    // Attempt Mongoose Save if connected
    if (mongoose.connection.readyState === 1) {
      const newContact = new Contact({ name, email, phone, city, role, program, message });
      await newContact.save();
    } else {
      // Fallback: save to local file
      const data = { name, email, phone, city, role, program, message, date: new Date() };
      fs.appendFileSync('contacts_fallback.json', JSON.stringify(data) + '\n');
    }

    res.status(201).json({ success: true, message: 'Message received successfully' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
