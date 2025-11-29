import express from 'express';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import auth from './routes/auth.routes.js';
import dashboard from './routes/dashboard.routes.js';
import payment from './routes/payment.routes.js';

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api", auth);
app.use("/api", dashboard);
app.use("/api", payment);

export default app;