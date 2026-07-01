const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BACKUP_DIR = path.join(__dirname, '../../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const getDbName = () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';
  const parts = uri.split('/');
  return parts[parts.length - 1].split('?')[0];
};

exports.createBackup = async (req, res, next) => {
  try {
    const dbName = getDbName();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toISOString().replace(/[:.]/g, '-').split('T')[1];
    const dateDir = path.join(BACKUP_DIR, dateStr);
    const backupName = `backup_${dateStr}T${timeStr}`;
    const backupFile = path.join(dateDir, `${backupName}.json`);

    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    for (const col of collections) {
      const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
      backupData[col.name] = data;
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    const stats = fs.statSync(backupFile);
    const totalDocs = collections.reduce((sum, col) => sum + (backupData[col.name]?.length || 0), 0);

    try {
      await require('../models/AuditLog').create({
        action: 'create',
        entity: 'settings',
        entityId: req.user?._id || 'system',
        entityName: `Database Backup: ${backupName}`,
        performedBy: req.user?._id || 'system',
        changes: { backupName, size: stats.size, collections: collections.length },
      });
    } catch (e) {}

    res.json({
      success: true,
      data: {
        name: backupName,
        fileName: `${dateStr}/${backupName}.json`,
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
        collections: collections.length,
        totalDocuments: totalDocs,
        createdAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
};

function walkBackupDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkBackupDir(fullPath));
    } else if (entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

exports.getBackups = async (req, res, next) => {
  try {
    const files = walkBackupDir(BACKUP_DIR);
    const backups = files.map((filePath) => {
      const stats = fs.statSync(filePath);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const collections = Object.keys(data);
      const totalDocs = collections.reduce((sum, col) => sum + (data[col]?.length || 0), 0);
      const relativePath = path.relative(BACKUP_DIR, filePath);
      const parsed = path.parse(relativePath);
      return {
        name: parsed.name,
        fileName: relativePath.replace(/\\/g, '/'),
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
        collections: collections.length,
        totalDocuments: totalDocs,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: backups });
  } catch (error) {
    next(error);
  }
};

exports.downloadBackup = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(fileName)}`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

exports.restoreBackup = async (req, res, next) => {
  try {
    const { fileName } = req.body;
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const collections = Object.keys(backupData);

    for (const collectionName of collections) {
      const data = backupData[collectionName];
      if (data && Array.isArray(data)) {
        const collection = mongoose.connection.db.collection(collectionName);
        await collection.deleteMany({});
        if (data.length > 0) {
          await collection.insertMany(data);
        }
      }
    }

    await require('../models/AuditLog').create({
      action: 'update',
      entity: 'settings',
      entityId: req.user._id,
      entityName: `Database Restored: ${fileName}`,
      performedBy: req.user._id,
      changes: { restoredFrom: fileName, collections },
    });

    res.json({ success: true, message: `Database restored from ${fileName}`, data: { collections, totalDocuments: collections.reduce((sum, col) => sum + (backupData[col]?.length || 0), 0) } });
  } catch (error) {
    next(error);
  }
};

exports.deleteBackup = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    fs.unlinkSync(filePath);

    const parentDir = path.dirname(filePath);
    if (parentDir !== BACKUP_DIR && fs.readdirSync(parentDir).length === 0) {
      fs.rmdirSync(parentDir);
    }

    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    next(error);
  }
};
