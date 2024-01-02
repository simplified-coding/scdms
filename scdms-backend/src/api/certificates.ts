import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ status: true, message: 'SCDMS - Certificates API' })
});

export default router