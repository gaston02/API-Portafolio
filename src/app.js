import express from 'express';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import auth from './routes/auth.routes.js';
import dashboard from './routes/dashboard.routes.js';

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api", auth);
app.use("/api", dashboard);

export default app;