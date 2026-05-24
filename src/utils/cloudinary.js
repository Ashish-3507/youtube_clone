//this code is same we can just copy paste this and use in different projects or work

import {v2 as cloudinary}from 'cloudinary';
import fs from 'fs';

    // Configuration allowing for uploading file and all
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localFilePath) =>{
    try{
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto",
        })
        //file has been uploaded successfull and we have removed that file from the local temp fouldr so it does not take space as we are uploading on cloudinary to save that
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }
        return response;
    }catch(error){
        console.log("Cloudinary Error:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            }
            return null;       //remove the locally saved temporary file as the upload operation got failed
    }
}


export {uploadOnCloudinary};
