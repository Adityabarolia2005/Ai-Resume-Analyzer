import mongoose from "mongoose";
import projectModal from "./project.model.js" 

const projectMemberSchema = mongoose.Schema({
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:projectModal
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:projectModal
    },
    role:{
        type:String,
        enum:["project_admin" , "member"]
    },
    jointAt:{
        type:Date
    }
},
    {
        timestamps:true
    }
);

export const projectMember = mongoose.model("projectMember" , projectMemberSchema);