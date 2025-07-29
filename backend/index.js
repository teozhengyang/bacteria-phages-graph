import express from 'express';
import mongoose from 'mongoose';

import configRoutes from './routes/config.js';
import resultsRoutes from './routes/results.js';
import userRoutes from './routes/user.js';

const app = express();
const port = 3000;

app.use(express.json());

const mongoUri = 'mongodb://localhost:27017/mydatabase';
app.use('/config', configRoutes);
app.use('/results', resultsRoutes);
app.use('/user', userRoutes);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  }); 

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

