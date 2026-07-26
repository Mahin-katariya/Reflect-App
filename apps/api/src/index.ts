import express from 'express';
import type { Express, Request, Response } from 'express';
import 'dotenv/config'

import { registerRouter } from './routes/register.js';


const app: Express = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3001;

app.get('/health', (req: Request, res: Response) => {
  // res.send('App running sucessfully ✅');
  res.json({ ok: "true" });
});

// ? API ROUTES
app.post('/register', registerRouter);

app.listen(PORT, () => {
  console.log(`apps/api running on PORT: ${PORT}`);
});
