import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asycnHandler.js";
import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js';


//i  this we are not using anything related to the res so we have put _ just one way of representing so that if seen in any other code i could read it
const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        //we can access now cookie as we have send that data in login controller now even though it is send to the brower how can we access them
        //we have a middelware in app.js||server.js of cookie()||cookieparser() what does this do as we send in res.cookie in this data it also help that 
        //the req body could also have those cookie and data so..
    
        const token = req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ", "")
    
        //so what happen here is that we are getting acces token from cookies if we do not have that we acces the req.header which have metadata
        //and tell it under req.header authorization which have this token this token is send by the frontend right so
        //under authorization be get it in the form of like this Bearer (space) <token> so we are replacing that "Bearer " with empty strning
        //so we are left with the only <token> so now we are accessing that token
    
        if(!token){
            throw new ApiError(401, "Unathorized access denied");
        }
        
        const decodetoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
            const user  = await User.findById(decodetoken?._id).select("-password -refreshtoken");
            if(!user){
            throw new ApiError(401, "Invalid access token");
            }
            req.user = user;
            next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
})

export default  verifyJWT ;