import mongoose from "mongoose";
import { User } from "./user.model.js";

const projectSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        default:"No description Provided by the creator"
    },
    createdBy:{
       type:mongoose.Schema.Types.ObjectId,
       ref:User
    }
},
{ 
    timestamps: true // <--- This is the second parameter
});

export const Project = mongoose.model("Project" , projectSchema)