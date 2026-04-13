import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
import connection from "./db/index.js";

connection()
.then(() => {
    app.listen(process.env.Port||8000, ()=>{
        console.log(`succesful connection on port:${process.env.PORT}`);
    })
})
.catch( (err) => {
    console.log(`Failed to coonect to the mongodb connection on the port: ${process.env.PORT}`);
})