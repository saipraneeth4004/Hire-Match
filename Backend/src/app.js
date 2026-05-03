const express = require('express');
const app = express();
const cookieParser = require('cookie-parser'); 
const cors = require('cors'); 

app.use(cors({
    origin:'https://hire-match-a163.vercel.app', 
    credentials:true 
}))

app.use(cookieParser());

app.use(express.json());

const authRouter = require('./routes/auth.routes');
app.use('/api/auth', authRouter); 

const interviewRouter = require('./routes/interview.routes');
app.use('/api/interview', interviewRouter);




module.exports = app;
