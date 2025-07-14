const express = require('express');
const app = express();
const cors = require('cors');
const leadsRouter = require('./routes/lead.routes');
const clientsRouter = require('./routes/client.routes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/leads', leadsRouter);
app.use('/api/clients', clientsRouter);

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
