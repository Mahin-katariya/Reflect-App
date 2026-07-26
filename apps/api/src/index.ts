import express from 'express';
import type { Express, Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';

import { registerRouter } from './routes/register.js';
import { topicsRouter } from './routes/topics.js';
import { requireAuth } from './middlewares/requiredAuth.js';
import { profileRouter } from './routes/profile.js';

const app: Express = express();

// ? origin: only request through this uri get CORS header
// ? credentials: tells browser to send cookies and the Authorization header on cross-origin request

app.use(cors({
  origin: [process.env.FRONTEND_URI!, "http://localhost:5173"],
  credentials: true
}))
app.use(express.json());



const PORT = process.env.PORT ?? 3001;

app.get('/health', (req: Request, res: Response) => {
  // res.send('App running sucessfully ✅');
  res.json({ ok: "true" });
});

app.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    ok: true,
    data: { userId: req.userId }
  });
})

// * API ROUTES * //
app.use(registerRouter);
app.use(topicsRouter);
app.use(profileRouter);

app.listen(PORT, () => {
  console.log(`apps/api running on PORT: ${PORT}`);
});
