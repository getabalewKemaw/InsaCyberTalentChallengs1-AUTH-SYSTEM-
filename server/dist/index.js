import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './libs/auth.js';
const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.all('/api/auth/*', toNodeHandler(auth));
app.use(express.json());
app.get('/', (req, res) => {
    res.json({ message: 'Server is running with Better Auth' });
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map