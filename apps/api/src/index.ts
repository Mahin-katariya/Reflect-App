import express from 'express';
import type { Express, Request, Response } from 'express';
import { log } from 'node:console';

const app: Express = express();
const PORT = process.env.PORT ?? 3000;

app.get('/health', (req: Request, res: Response) => {
  // res.send('App running sucessfully ✅');
  res.json({ ok: "true" });
});

app.listen(PORT, () => {
  console.log(`apps/api running on PORT: ${PORT}`);
});
