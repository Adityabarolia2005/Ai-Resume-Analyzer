import mongoose from "mongoose";

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
    assignedTo:{
      type: mongoose.Schema.Types.ObjectId,
      ref : "User",
      default: null
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
