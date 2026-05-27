import mongoose, { mongo, Schema } from "mongoose";

const subsriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
},
{
    timestamps:true,
})


const Subscription = new mongoose.model("subscription", subsriptionSchema);
export {Subscription};