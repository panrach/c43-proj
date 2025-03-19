import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import portfolioRouter from './routes/portfolio.js';
import stockRouter from './routes/stocks.js';
import cors from 'cors';
import corsOptions from '../config/corsConfig.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'yefefaefsfkaehfoaiuehf',
    resave: false,
    saveUninitialized: false, // Ensure the session is not saved unless modified
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/portfolio', portfolioRouter);
app.use('/stocks', stockRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});