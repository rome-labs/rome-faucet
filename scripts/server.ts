import express from 'express';
import airdropRoute from './routes/airdrop';
import loadEnv from './utils/env';

const app = express();
const { port, airdropTitle, recaptchaSiteKey } = loadEnv();

app.set('view engine', 'ejs');

app.use('/static', express.static('public'))

app.use(express.json());
app.use('/airdrop', airdropRoute);

app.get('/request_airdrop', (req, res) => {
  res.render('index', { AIRDROP_TITLE: airdropTitle, RECAPTCHA_SITE_KEY: recaptchaSiteKey });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
