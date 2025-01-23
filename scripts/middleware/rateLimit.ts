import express from 'express';

interface RateLimitEntry {
    amount: number;
    lastAirdropTime: number;
}

const rateLimitMap: Record<string, RateLimitEntry> = {};

const sixHours = 6 * 60 * 60 * 1000;

export const rateLimitMiddleware = (req: express.Request, res: express.Response) => {
    const { recipientAddr, amount } = req.body;
    const currentTime = Date.now();

    if ( parseFloat(amount) > 100) {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. You can only receive a maximum of 100 tokens one time.'
        });
        return true;
    }

    if (!rateLimitMap[recipientAddr]) {
        rateLimitMap[recipientAddr] = { amount: 0, lastAirdropTime: currentTime };
    }

    const entry = rateLimitMap[recipientAddr];
    const timeDifference = currentTime - entry.lastAirdropTime;

    if (timeDifference < sixHours && entry.amount + parseFloat(amount) > 100) {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. You can only receive a maximum of 100 tokens within 6 hours.'
        });
        return true;
    }

    return false;
};

// Update rate limit only after a successful transaction
export const updateRateLimit = (recipientAddr: string, amount: number) => {
    const currentTime = Date.now();

    if (!rateLimitMap[recipientAddr]) {
        rateLimitMap[recipientAddr] = {
            amount: amount,
            lastAirdropTime: currentTime
        };
    } else {
        const entry = rateLimitMap[recipientAddr];
        const timeDifference = currentTime - entry.lastAirdropTime;

        if (timeDifference < sixHours) {
            entry.amount += amount;
        } else {
            rateLimitMap[recipientAddr] = {
                amount: amount,
                lastAirdropTime: currentTime
            };
        }
    }
};
