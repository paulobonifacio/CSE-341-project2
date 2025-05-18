require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota raiz para exibir mensagem útil
app.get('/', (req, res) => {
  res.send(`
    <h2>🚀 Contacts API is on!</h2>
    <h2>📚 Access the <a href="/api-docs" target="_blank">Swagger Documentation</a></h2>
  `);
});

// Mongoose connection status logging
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from database');
});

mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Contacts API is on!`);
  console.log(`📚 Swagger docs available at: https://cse-341-project2-jwva.onrender.com/api-docs`);
});
