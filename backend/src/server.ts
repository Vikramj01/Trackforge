import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scan';
import generateRoutes from './routes/generate';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/scan', scanRoutes);
app.use('/api/generate', generateRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'Atlas TrackForge API' });
});

app.listen(PORT, () => {
  console.log(`Atlas TrackForge API running on port ${PORT}`);
});

export default app;
