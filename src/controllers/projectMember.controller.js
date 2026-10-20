import { ProjectMember } from "../models/projectMember.model.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/response.js";

export const deleteMember = async function (req, res, next) {
    const { projectId, userId } = req.params; //a project can consist of many users 
    if (!projectId || !userId) {
        return next(new ApiError(401, "Determine the member to be delete from the project"))
    }
    try {
            const deleteData = await ProjectMember.findOneAndDelete({
                project: projectId,
                userId
            })
            if (!deleteData) {
            return next(new ApiError(404, "The selected User doesn't found inside the project"))
            }
            res.status(200).json(
                new ApiResponse(200, "The member has been removed from the project", deleteData)
            )
        }
    catch(error){
        next(error);
    }
}

export const addProjectMember = async function (req, res, next) {
    const { projectId } = req.params;
    const { userId, role = "member" } = req.body;

    if (!userId) {
        return next(new ApiError(400, "userId is required"));
    }

    try {
        const project = await Project.findOne({
            _id: projectId,
            createdBy: req.user.id
        });

        if (!project) {
            return next(new ApiError(403, "Only the project owner can add members"));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        const existingMember = await ProjectMember.findOne({ project: projectId, userId });
        if (existingMember) {
            return next(new ApiError(409, "User is already a project member"));
        }

        const member = await ProjectMember.create({ project: projectId, userId, role });

        return res.status(201).json(
            new ApiResponse(201, "Project member added successfully", member)
        );
    } catch (error) {
        return next(error);
    }
};

export const getProjectMembers = async function (req, res, next) {
    try {
        const members = await ProjectMember.find({ project: req.params.projectId })
            .populate("userId", "userName email globalRole")
            .sort({ joinedAt: 1 });

        return res.status(200).json(
            new ApiResponse(200, "Project members fetched successfully", members)
        );
    } catch (error) {
        return next(error);
    }
};

export const getProject = async function (req, res, next) {
    try {
        const projects = Project.find().populate("createdBy", "userName email").sort({ createdAt: -1 });
        if (!projects) {
            return next(new ApiError(404, "No project is there "));
        }
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
}

export const updateMember = async function (req, res, next) {
    const { projectId, memberId } = req.params; //a project can consist of many users 
    const { role } = req.body;

    if (!["member", "project_admin"].includes(role)) {
        return next(new ApiError(400, "Invalid role"));
    }
    try{
        const updatedMember = await ProjectMember.findOneAndUpdate(
        {
            project: projectId,
            userId: memberId
        },
        { $set: { role } },
        { new: true, runValidators: true }
    );
         if(!updatedMember){
            return next(new ApiError(400 , "database doesnt update the modal"));
         }
         res.status(200).json(new ApiResponse(200 , "The member role is Updated" , updatedMember));
    }catch(error){
        next(error);
    }
    
}  