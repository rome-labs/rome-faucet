import express from 'express';
import Web3 from 'web3';
import axios from 'axios'; // Replace node-fetch with axios
import loadEnv from '../utils/env';
import { rateLimitMiddleware, updateRateLimit } from '../middleware/rateLimit';

const router = express.Router();
const { httpAddr, senderAddrs, privateKeys, recaptchaSiteKey, recaptchaSecretKey } = loadEnv();

const web3 = new Web3(httpAddr);

// Toggle CAPTCHA validation
const enableCaptcha = Boolean(recaptchaSiteKey && recaptchaSiteKey.trim());

// Define the expected response type for Google's reCAPTCHA API
interface CaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// Function to get a random sender address and its private key
function getRandomSender() {
  const index = Math.floor(Math.random() * senderAddrs.length);
  return { senderAddr: senderAddrs[index], privateKey: privateKeys[index] };
}

// CAPTCHA Validation Function
async function validateCaptcha(captchaResponse: string | null | undefined): Promise<boolean> {
  // Check if captchaResponse is empty or null
  if (!captchaResponse) {
    console.error('CAPTCHA response is empty or null.');
    return false; // Fail validation if no response
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const { data } = await axios.post<CaptchaResponse>(verifyUrl, null, {
      params: {
        secret: recaptchaSecretKey,
        response: captchaResponse,
      },
    });

    return data.success; // Returns true if CAPTCHA is valid
  } catch (error) {
    console.error('Error validating CAPTCHA:', error);
    return false; // Treat any errors as CAPTCHA validation failure
  }
}

router.post('/', async (req, res) => {
  const { recipientAddr, amount, captchaResponse } = req.body;

  // Validate CAPTCHA if enabled
  if (enableCaptcha) {
    if (!captchaResponse) {
      return res.status(400).json({ success: false, error: 'CAPTCHA response is required.' });
    }

    const isCaptchaValid = await validateCaptcha(captchaResponse);
    if (!isCaptchaValid) {
      return res.status(400).json({ success: false, error: 'CAPTCHA verification failed.' });
    }
  }

  // Check the rate limit before proceeding
  const rateLimitExceeded = rateLimitMiddleware(req, res);
  if (rateLimitExceeded) return;

  const { senderAddr, privateKey } = getRandomSender();

  try {
    const transaction = {
      from: senderAddr,
      to: recipientAddr,
      value: web3.utils.toWei(amount, 'ether'),
      nonce: await web3.eth.getTransactionCount(senderAddr, 'pending'),
      gas: 22000,
      gasPrice: await web3.eth.getGasPrice(),
      chainId: await web3.eth.getChainId(),
    };

    console.log(`Airdrop ${amount} ETH from ${senderAddr} to ${recipientAddr}`);

    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);

    updateRateLimit(recipientAddr, parseFloat(amount));

    res.json({ success: true, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error occurred.' });
  }
});

export default router;
