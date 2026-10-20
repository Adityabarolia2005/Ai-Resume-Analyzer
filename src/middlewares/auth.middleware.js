import jwt from "jsonwebtoken"
import { ApiError } from "../utility/apiError.js";
import "dotenv/config";

export const authMiddleware = function(req , res , next){
    const accessToken = req.cookies.accessToken;
   if(!accessToken){
    return next(new ApiError(401 , "The authorization is required"))
   }
   try{
    const decodedUser = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decodedUser;
    next();
   }catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}