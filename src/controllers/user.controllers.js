import { asyncHandler } from "../utils/asycnHandler.js";

const userRegister = asyncHandler(async(req,res)=>{
    res.staus(200).json({
        message:"ok",
    })
})

export {userRegister};