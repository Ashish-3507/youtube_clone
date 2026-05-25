import { Router} from "express";
import {logOutUser, loginUser, userRegister ,  refreshAccessToken} from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middelware.js';
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();


//we are using multer upload method here as we have to post data on the server wich is file so inside the .post() we have writen some credentials
//like name or variable under which the tring is store thr amount of file we can upload and all that and rounting to the controlerr userregister
router.route("/register").post
(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    userRegister
);
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT , logOutUser);
router.route("/refresh-Token").post(refreshAccessToken);

export default router