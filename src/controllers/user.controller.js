import { asyncHandler } from "../utils/aysncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken}
        
        

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")

    }
}
const registerUser=asyncHandler(async(req,res)=>{
   

    const {fullName,email,username,password}= req.body
    


   if(
    [fullName,email,username,password].some((field)=>field?.trim()==="")
   ){

    throw new ApiError(400,"All fields are required")
   }
   const existedUser=await User.findOne({
    $or:[{email},{username}]
   })
   if (existedUser){
    throw new ApiError(409,"User already exists")
   }
   const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
   }
const avatar =await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath)
if(!avatar){
    throw new ApiError(400,"Error uploading avatar")
}
const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",//agar by chance url na ho tab empty bhej do crash na karwaye
    email,
    username:username.toLowerCase(),
    password

})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new ApiError(500,"somethign went wring while registering the user")
}
return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)

})
const loginUser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body ;
    if(!email ||!password){
        throw new ApiError(400,"Email and password are required")
    }
    const user=await User.findOne({//did awiait
        $or:[{email},{username}]
    })
if(!user){
    throw new ApiError(404,"User does not exist")
}
const isPasswordValid =await user.isPasswordCorrect(password);
//const isPasswordValid=await bcrypt.compare(password,user.password)
if(!isPasswordValid){
    throw new ApiError(401,"invalid user credentials")
}
const{accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
const options={
    httpOnly:true,
    secure:true,
    
}
return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{
    accessToken,
    refreshToken,
    user:loggedInUser
},"User logged in successfully"))
})
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:"undefined"
        }
    },
{
    new:true
})
const options={
    httpOnly:true,
    secure:true,
    
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,null,"User logged out successfully"))

    
    
})
export {registerUser,loginUser,logoutUser}

