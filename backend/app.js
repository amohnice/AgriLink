const express = require('express');
const app = express();
const adminRoutes = require('./routes/adminRoutes');

// ... existing code ...
app.use('/api/admin', adminRoutes);
// ... existing code ... 