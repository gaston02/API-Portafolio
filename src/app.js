import express from 'express';
import morgan from 'morgan';
import auth from './routes/auth.routes.js';

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use("/api", auth);

export default app;