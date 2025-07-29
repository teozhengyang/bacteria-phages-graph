import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Results endpoint');
});

router.get('/details', (req, res) => {
  res.send('Results details endpoint');
});

export default router;