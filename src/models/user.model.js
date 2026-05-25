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
        type:String, //cloudinary url
    },
    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
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

userSchema.pre("save", async function () {
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10);
})//to only hash when the password field is mmodified

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
} // now this method/function is used to compare the given data from user to check from the data is they are same or not if not then returns false if yes then returns true


//uhere we have don this that we have made that when ever a user is being made then that user have a method known as generateaccesstoken ot
//we can say that we have used the userschema data to create a method known as generateaccesstoken that every user. can use not User but user(specefic user that is been created when signed up)
userSchema.methods.generateAccessToken = function(){

    //jwt.sign is used to create token which is made using jwt.sign(payload,secreat,option) where
    //patload:is the data inside the token here: of the current loogedin user accessed using this. to create token and store in this payload
    //secrete is the  process.env.ACCESS_TOKEN_SECRET, which should not be exposed and save in the .env file 
    //Backend uses this secret to:create token,verify token later   Without correct secret:token becomes invalid
    //options:mainly expiresIn:process.env.ACCESS_TOKEN_EXPIRY, this which tell in how much time the token will be invalid ex..15d 7h ect
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

//here we do not need as much data as that of access token as this is used to create a new access token so just knowing the user is enough
//thats why for the security and other reason it have long expity time compared to access token this just create new accesstoken as that expiry
//access token is send repeatly as req,header(authorization) from frontend not the refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}


export  const User = mongoose.model("User", userSchema);