import { Router} from "express";
import { userRegister } from "../controllers/user.controllers.js";
import {upload} from '../middelwares/multer.middelware.js';

const router = Router();

router.route("/register").post
(
    upload.fields(
        {
            name:"avatar",
            maxcount: 1
        },
        {
            name: "coverimage",
            maxcount: 1,
        }
    ),
    userRegister
);

export default router