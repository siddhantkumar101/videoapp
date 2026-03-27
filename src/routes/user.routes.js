import {upload} from "../middlewares/multer.middleware.js";
import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
    } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1

    },
    {
        name:"coverImage",
        maxCount:1

    }

    ]),
    registerUser
);
router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/changepassword").post(verifyJwt,changeCurrentPassword)
router.route("/me").get(verifyJwt,getCurrentUser)
router.route("/update-account-details").post(verifyJwt,updateAccountDetails)

router.route("/watch-history").get(verifyJwt,getWatchHistory)
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
router.route("/history").get(verifyJwt,getWatchHistory)
export default router;
