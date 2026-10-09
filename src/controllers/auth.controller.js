import { User } from "../modals/user.model"
import { ApiError } from "../utility/apiError";

const registerUsers = function(req , res){
    const {password , email , userName} = req.body;
    if(!password || !email || !userName){
        next(new ApiError(400 , "Validation error in the request body"));
    }
    
}
