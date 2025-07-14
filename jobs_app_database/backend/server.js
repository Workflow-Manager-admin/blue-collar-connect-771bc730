require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const companyRoutes = require('./routes/companies');
const applicationRoutes = require('./routes/applications');
const messageRoutes = require('./routes/messages');
const { authenticateJWT } = require('./middleware/authenticate');

const app = express();

app.use(express.json());
app.use(cors());

const mongoUrl = process.env.MONGODB_URL || "mongodb://appuser:dbuser123@localhost:5000/?authSource=admin";
const mongoDb = process.env.MONGODB_DB || "myapp";
mongoose.connect(mongoUrl, {
  dbName: mongoDb,
}).then(() => {
  console.log(`Connected to MongoDB database "${mongoDb}"`);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => { res.send('Blue-collar Jobs API: v1'); });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', authenticateJWT, applicationRoutes);
app.use('/api/messages', authenticateJWT, messageRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
