import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username:
    {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,//for allowing searching field and optimizing that
    },
    email:
    {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String, //cloudinary url
        required:true,
    },
    coverimage:{
        type:String,
    },
    watchHistory:[{
        type:Schema.type.ObjectId,
        ref: "Video",
    }],
    password:{
        type: String,
        required:[true, "Password is required"],
    },
    refreshToken:{
        type: String,
    }
},
{
    timestamps:true,
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})//to only hash when the password field is mmodified

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
} // now this method/function is used to compare the given data from user to check from the data is they are same or not if not then returns false if yes then returns true

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefereshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFERESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFERESH_TOKEN_EXPIRY,
        }
    )
}


export  const User = mongoose.model("User", userSchema);