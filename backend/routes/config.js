import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Config endpoint');
});

router.get('/details', (req, res) => {
  res.send('Config details endpoint');
});

export default router;