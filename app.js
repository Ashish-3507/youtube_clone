import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const corsoption = {
    origin:'*',
    optionsSuccessStatus:200
}
app.use(cors(corsoption));
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true, limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

//importing routes
import userRouter from './src/routes/user.router.js';






//routes declaration
app.use("/api/v1/user", userRouter);



export default app;
