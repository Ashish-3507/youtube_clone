import { asyncHandler } from "../utils/asycnHandler.js";
import {ApiError} from '../utils/ApiErrors.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary}  from "../utils/cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js';
import { upload } from "../middlewares/multer.middelware.js";
import jwt  from "jsonwebtoken";


//create this after you taking the (specefic)user out nor the User model one which allow us to take a userid when logedin and
//generate a access and refresh token for that user
const generateRefreshAndAccessToken = async(userid)=>{
    try{
        const user =await User.findById(userid);

        if (!user) {
            throw new ApiError(404, "User not found");
            }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();


        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});


        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500, error?.message || "Something went wrong while generating refresh and access token ")
    }
}

const userRegister = asyncHandler(async(req,res)=>{
    //get user details from the frontend;
    //validate if user have send or write all the required fields 
    //check wheather the given user exitist: username,email
    //check image and avatar
    //upload them on the cloudinary
    //check if avatar they are successfully uploaded
    //create user object:- create user entry in db
    //check if the user is created 
    //remove paswword and refreshh tocken from the response
    //send the responose

    const {fullname, email, username, password} = req.body;

/////////////////////////////////////////////////////////////////////

    //checking validating if all the given input details are filled if notthem give me that empty field and use the appierror utility too through error
    //validating the fields
    const emptyfields = [fullname,username,email,password].find((fields)=>{
        return fields.trim() ==="";
    })
    if(emptyfields){
        throw new ApiError(404,`${emptyfields} is required`);
    }

////////////////////////////////////////////////////////////////

        //checking user if it already exist or not
        const userExist = await User.findOne({
            $or:[{username}, {email}]
        });
        if(userExist){
            throw new ApiError(409, "user already exist");
        }

////////////////////////////////////////////////////////////////
//hadling files and images as we cannot handle them directly like we did with fields to handle the files is done with the help of multer
        const avatarLocalPath = req.files?.avatar?.[0]?.path;               //if(?) we hav file which file .avatar which we named at routes with the help of upload.fields 
                                                                         //what happening is that in multer middelware we have created a storage nested object where at index 0 we store the path of file and at 1 we store the name wich we have keept original file name
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar image is required");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar){
            throw new ApiError(400, "Avatar image is not uploaded");
        };

        //creating user object to ener in the db
        const user = await User.create({
            fullname,
            username: username.toLowerCase(),
            avatar: avatar.url,
            coverimage:coverImage?.url || "",
            password,
            email,
        });
        
        /////////////////////////////////////////////////
        //checking wheather the user is created or not now if user is created then we have _iduser created by the mongodb so..
        const createdUser = await User.findById(user._id).select("-password -refreshToken");//find the user with id then remove the password and refreshtoken field for res

        if(!createdUser){
            throw new ApiError(400, "Something went wrong while registering the user");
        }

        return res.status(200).json(
            new ApiResponse(201, createdUser, "User is registered successfully")
        );

});

const loginUser =asyncHandler(async(req,res)=>{
    //data from req.body
    //check wheather the user exist using username or email
    //check is the password is rigth;
    //generate refresha and acess token
    //send those token using cookies

    const {email, username, password} = req.body;

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
            $or:[{email} , {username}]
    })
    if(!user){
        throw new ApiError(400, "user does not exist");
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400, "the entered password is wrong");
    }

    const {accessToken, refreshToken} =await generateRefreshAndAccessToken(user._id);


    //instead of useing query to againtake user while leaving out the password and token example inregister user 
    //to  send respons i converted the data of user i have into object so now instead of mongodb method we can use javascript one and manupulate that data inserver instead of going back and forth between
    //server and db which could be expensive depending on situation;
    
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    //now we will creating options to send response and cookies with it 
    //so designing options for the cookies
    const option = {
        httpOnly:true,
        secure:true
    }

    //now we have designed the option for cookies normaly cookies can be modified from both backend and frontend 
    //but as we allow true to httpOnly and secure now cookies can only be modified from the server

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken" , refreshToken, option)
    .json(
        new ApiResponse(200, {
        user: loggedInUser, refreshToken,accessToken
            },
        "User is succesfully logendIN"
        )
    )
})

const logOutUser = asyncHandler(async(req,res)=>{
    //remove accesstoken and refreshtoken to logout 
    //remoove the refreshtoken from the user datamodel
    //clearing the cookie

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{ 
                refreshToken: undefined
            },
        },
        {
                new:true,
            }
    );

    const option={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User is successfull loged out!!"));
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken||req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        const decodedTOken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
    
        const user = User.findById(decodedTOken?._id);
        if(!user){
            throw ApiError(401, "invalid refresh token!!")
        }
        if(incomingRefreshToken != user?.refreshToken){
            throw ApiError(401, "invalid refresh token or expired!!");
        }
    
        const option = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken , newRefreshToken} = await generateRefreshAndAccessToken(user._id);
    
        res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(
            new ApiResponse(200, {accessToken, newRefreshToken} , "Token generated successfully")
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "invalid token!!!!")
    }
})

const changePassword = asyncHandler(async(req,res)=>{
    //extracting oldpassowrd input and new password input
    const {oldPassword, newPassword} = req.body;
    
    //we have a auth middel ware before running this req where we check jwt where we also have the user in req.use from there we took 
    //the user by finding its is that is saved in there 
    const user = await User.findById(req?.user._id);

    //checking if the prev or old password entered is correct or not
    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"the givenpassword is incorrect");
    }

    //if correct save insde or change the password of the user that we took
    user.password = newPassword;

    //validation of means no need to chack all required that we have set in database when saving this
    user.Save({
        validateBeforeSave:false,
    })

    return res.status(200).json(
        new ApiResponse(200, {},  "The password is successfully chnaged")
    )
})

const currenttUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        200, req.user, "current user fetched successfully"
    )
})

const changeUserDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body;
    if(!email || !fullname ){
        throw new ApiError(400, "fill the input fields");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{  //two was to set data in data base....
                fullname,
                email:email
            }
        },
        {new:true},
    ).select("-password");

    return res.status.json(
        new ApiResponse(200, {} , "the user data is updated sucessfully")
    )
})

const updateAvatar =asyncHandler(async(req,res)=>{
    //where did i got req.file fromits is middel ware multer that we will apply to the routes of this crontroller 
    //and req.files to access multiple file if just one then req.file
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"file is not uploaded on the cloude properly");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url,
            }
        },
        {new:true},
    ).select("-password");

    return res.status(200).json(200,"Avatar is uploaded/changed successfully");
})

const upadateCoverIMage =asyncHandler(async(req,res)=>{
    //where did i got req.file fromits is middel ware multer that we will apply to the routes of this crontroller 
    //and req.files to access multiple file if just one then req.file
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"avatar file is missing");
    }
    const coverImage = await uploadOnCloudinary(avatarLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"file is not uploaded on the cloude properly");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url,
            }
        },
        {new:true},
    ).select("-password");

    return res.status(200).json(200,"coverImage is uploaded/changed successfully");
})

export {userRegister,
        loginUser,
        logOutUser,
        refreshAccessToken,
        changePassword,
        currenttUser,
        changeUserDetails,
        updateAvatar,
        upadateCoverIMage,
};