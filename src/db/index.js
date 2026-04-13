import mongoose from 'mongoose';

const connection =async()=>{
    try{
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Mongodb is connected: ${mongoose.connection.host}`);
}
catch(err){
    console.error(`Failed connection: ${err}`);
}
}

export default connection;