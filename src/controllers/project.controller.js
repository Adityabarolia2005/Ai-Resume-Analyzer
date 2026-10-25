import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectMember.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/response.js";

export const createProject = async function (req, res, next) {
    const { projectName, description } = req.body;
    const userId = req.user.id;

    if (!projectName) {
        return next(new ApiError(400, "Project name is required"));
    }

    try {
        const project = await Project.create({
            name: projectName,
            description,
            createdBy: userId,
        });

        return res.status(201).json(
            new ApiResponse(201, "Project created successfully", project)
        );
    } catch (error) {
        return next(error);
    }
};

export const getProjects = async function (req, res, next) {
    try {
        const projects = await Project.find({
            createdBy: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, "Projects fetched successfully", projects)
        );
    } catch (error) {
        return next(error);
    }
};

export const getProjectById = async function (req, res, next) {
    const { projectId } = req.params;
    if (!projectId) {
        return next(new ApiError(400, "Please select the project"));
    }
    try {
        const project = await Project.findById(projectId); //for searching the id use the .findById( ) <= dont take any object inside 
        if (!project) {
            return next(new ApiError(404, "Selected project not found"));
        }

        return res.status(200).json(
            new ApiResponse(200, "Selected project accessed successfully", project)
        );
    } catch (error) {
        return next(error);
    }
};




export const updateProject = async function (req, res, next) {
    const { newProjectName, newDescription } = req.body;
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!newProjectName && !newDescription) {
        return next(
            new ApiError(
                400,
                "Provide a new project name or description"
            )
        );
    }

    try {
        const updatedProject = await Project.findOneAndUpdate(
            {
                _id: projectId,
                createdBy: userId
            },
            {
                $set: {
                    ...(newProjectName && { name: newProjectName }),
                    ...(newDescription && { description: newDescription })
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProject) {
            return next(
                new ApiError(404, "Project not found or you are not the owner")
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project details updated successfully",
                updatedProject
            )
        );
    } catch (error) {
        return next(error);
    }
};

export const deleteProject = async function (req, res, next) {
    const { projectId } = req.params;

    try {
        const project = await Project.findOne({
            _id: projectId,
            createdBy: req.user.id
        });

        if (!project) {
            return next(new ApiError(404, "Project not found or you are not the owner"));
        }

        await Promise.all([
            ProjectMember.deleteMany({ project: projectId }),
            Task.deleteMany({ project: projectId }),
            Project.deleteOne({ _id: projectId })
        ]);

        return res.status(200).json(
            new ApiResponse(200, "Project and its tasks and members deleted successfully")
        );
    } catch (error) {
        return next(error);
    }
};
