interface Config {
  httpAddr: string;
  port: number;
  senderAddrs: string[];
  privateKeys: string[];
  airdropTitle: string;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
}

export default function loadEnv(): Config {
  // Provide default values or throw an error if the environment variables are not set
  const httpAddr = process.env.HTTP_ADDR || 'http://0.0.0.0:8545';

  const port = process.env.PORT ? parseInt(process.env.PORT) as number : 3000;

  // Parse comma-separated sender addresses and private keys
  const senderAddrs = process.env.AIRDROP_ADDRESS ? process.env.AIRDROP_ADDRESS.split(',') : [];
  const privateKeys = process.env.AIRDROP_PRIVATE_KEY ? process.env.AIRDROP_PRIVATE_KEY.split(',') : [];

  if (senderAddrs.length !== privateKeys.length) {
      throw new Error('Mismatch between the number of sender addresses and private keys.');
  }

  const airdropTitle = process.env.AIRDROP_TITLE || 'Rome Faucet';
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || '';
  const recaptchaSecretKey = process.env.RECAPTCHA_SITE_SECRET || '';

  return { httpAddr, port, senderAddrs, privateKeys, airdropTitle, recaptchaSiteKey, recaptchaSecretKey };
}
