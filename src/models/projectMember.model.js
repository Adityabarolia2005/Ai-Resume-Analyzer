import mongoose from "mongoose";

const projectMemberSchema = mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["project_admin", "member"],
        default: "member"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

projectMemberSchema.index({ project: 1, userId: 1 }, { unique: true });

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);
