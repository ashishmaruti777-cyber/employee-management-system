const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

router.get('/', async (req, res) => {
  const checks = {};

  checks.backend = { status: 'up', uptime: process.uptime(), memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB' };

  try {
    const state = mongoose.connection.readyState;
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    checks.mongodb = { status: state === 1 ? 'up' : 'down', state: stateMap[state] || 'unknown' };
  } catch (e) {
    checks.mongodb = { status: 'down', error: e.message };
  }

  checks.system = {
    platform: os.platform(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
    uptime: Math.round(os.uptime() / 3600) + ' hours',
  };

  const allUp = Object.values(checks).every(c => c.status === 'up');

  res.json({
    success: true,
    status: allUp ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

router.get('/connect', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running and connected!',
    timestamp: new Date().toISOString(),
    server: {
      platform: os.platform(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      uptime: Math.round(process.uptime()) + ' seconds',
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
    }
  });
});

module.exports = router;
