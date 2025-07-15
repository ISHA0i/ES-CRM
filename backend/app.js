const express = require('express');
const app = express();
const cors = require('cors');
const leadsRouter = require('./routes/lead.routes');
const clientsRouter = require('./routes/client.routes');
const inventoryRouter = require('./routes/inventory.routes');
const componentRouter = require('./routes/component.routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/leads', leadsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/components', componentRouter);

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
