// index.js or server.js
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const todoRoutes = require('./routes/todoRoutes');
const cookieParser = require('cookie-parser');
var cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', 
  credentials: true 
}));

// mongoose.connect(process.env.MONGO_URI)
const Users = require('./models/userModel');
const ToDo = require('./models/todoModel');

app.use(cookieParser());

connectDB();

app.use('/api/v1', userRoutes);
app.use('/api', todoRoutes);

app.get('/', (req, res) => {
  res.json('API is running...');
});

let port = process.env.PORT || 5000;

app.listen(port , () => {
  console.log(`Server running on port ${port}`);
});
