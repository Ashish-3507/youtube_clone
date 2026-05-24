import { asyncHandler } from "../utils/asycnHandler.js";
import {ApiError} from '../utils/ApiErrors.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary}  from "../utils/cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js';
import { upload } from "../middelwares/multer.middelware.js";

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

})

export {userRegister};