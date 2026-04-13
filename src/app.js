import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const corsoption = {
    origin:'*',
    optionsSuccessStatus:200
}
app.use(cors(corseoption));
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true, limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser());



export default app;
