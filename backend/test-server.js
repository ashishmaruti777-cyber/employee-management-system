const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));

const PORT = 5000;
mongoose.connect('mongodb+srv://emsadmin:empss123@cluster0.rohxxmf.mongodb.net/employee_management?retryWrites=true&w=majority')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(e => {
    console.error('MongoDB Error:', e.message);
    process.exit(1);
  });
