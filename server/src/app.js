const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');

dotenv.config();
require('./config/passport'); // passport config

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();
app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI missing in env');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server listening on ${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
