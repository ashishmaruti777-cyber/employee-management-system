const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test route first
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function startServer() {
  try {
    await connectDB();
    console.log('MongoDB connected, loading routes...');
    
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/employees', require('./src/routes/employees'));
    app.use('/api/departments', require('./src/routes/departments'));
    app.use('/api/attendance', require('./src/routes/attendance'));
    app.use('/api/payroll', require('./src/routes/payroll'));
    app.use('/api/settings', require('./src/routes/settings'));
    app.use('/api/charts', require('./src/routes/charts'));
    app.use('/api/roles', require('./src/routes/roles'));
    app.use('/api/users', require('./src/routes/users'));
    app.use('/api/shifts', require('./src/routes/shifts'));
    app.use('/api/reports', require('./src/routes/reports'));
    app.use('/api/admin', require('./src/routes/admin'));
    app.use('/api/backup', require('./src/routes/backup'));
    
    console.log('All routes loaded');
    
    const frontendPath = path.join(__dirname, '../frontend/build');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server start failed:', error.message);
    process.exit(1);
  }
}

startServer();
