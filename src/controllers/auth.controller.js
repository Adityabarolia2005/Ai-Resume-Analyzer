import { User } from "../models/user.model.js"
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/response.js";
import jwt from "jsonwebtoken"
import "dotenv/config"

export const registerUser = async function (req, res, next) {
    const { password, email, userName } = req.body;
    if (!password || !email || !userName) {
        return next(new ApiError(400, "Validation error in the request body"));
    }
    //check the existence of the user in before
    let existingUser;
    try {
        existingUser = await User.findOne({
            $or: [{ email }, { userName }]
        });
    } catch (error) {
        return next(error);
    }

    if (existingUser) {
        return next(new ApiError(409, "Email or username already exists"));
    }

    //wee dont need to determine the error's of the mondodb data base it itself determines the object 

    try {
        const userData = await User.create({
            userName,
            email,
            password,
            globalRole: "member",
        });

        const safeUser = {
            id: userData._id,
            userName: userData.userName,
            email: userData.email,
            globalRole: userData.globalRole,
        };

        return res.status(201).json(
            new ApiResponse(
                201,
                "The registration has been successfully completed",
                safeUser
            )
        );
    } catch (error) {
        return next(error);
    }

};


export const loginUser = async function (req , res , next){
    const {password , email , userName} = req.body;
    if(!email || !password || !userName){
        return next(new ApiError(401 , "Please enter the required fields"));
    }
    const isValid = User.isPasswordCorrect(password);
    if(!isValid){
        return next(new ApiError(400 , "Kindly check the login cridentials"))
    }
    const tocken = jwt.sign(
       {
        userName,
        email
       },process.env.JWT_SECRET 
    )
     return  res
        .cookie("accessTocken" , tocken , {
        httpOnly:true,
        secure:process.env.CURREN_ENV === "production",
        sameSite:"lax",
        maxAge:24*60*60*1000
    })
    .json(
        new ApiResponse(201 , "The User has been signedIn" , tocken)
    )
}


