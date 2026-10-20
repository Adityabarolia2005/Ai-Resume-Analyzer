import mongoose from "mongoose";
import { Project } from "./project.model.js";
import { User } from "./user.model.js";

const taskSchema = mongoose.Schema({
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
     description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignTo:{
      type: mongoose.Schema.Types.ObjectId,
      ref : "User",
      required: true
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    attachments: {
      type: [
        {
          url: String,
          publicId: String,
          mimeType: String,
          size: Number,
          originalName: String,
        },
      ],
      default: [],
    }
},{
    timestamps:true
});

export const Task = mongoose.model("Task", taskSchema);