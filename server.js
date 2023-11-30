import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import PlansRouter from './Routers/Plans.js';
import UsersRouter from './Routers/Users.js';
import connectDB from './mongoose.js';

const app = express();

connectDB()

const corsOptions = cors({
    origin: true,
    credentials: true
})
app.options('*', cors(corsOptions));
app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.json());
app.use(PlansRouter);
app.use(UsersRouter);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});

export default app;