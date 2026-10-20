import { ApiError } from "../utility/apiError.js";
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utility/response.js";


export const addTask = async function (req, res, next) {
    const { projectId } = req.params;
    const { taskTitle, taskDescription, taskAttachments } = req.body;
    const userId = req.user.id;

    if (!projectId) {
        return next(new ApiError(400, "Project ID is required"));
    }
    if (!taskTitle || !taskDescription) {
        return next(new ApiError(400, "Please pass the title and the description of the task"))
    }
    try {
        const taskData = await Task.create({
            project: projectId,
            title: taskTitle,
            description: taskDescription,
            createdBy: userId,
            status: "todo",
            attachments: taskAttachments || []
        });
        if (!taskData) {
            return next(new ApiError(404, "The project not found in the db whith specific projectId"));
        }
        return res.status(201).json(
            new ApiResponse(201, "Task added successfully", taskData)
        );
    }
    catch (error) {
        next(error);
    }
}

export const getTasksInsideProject = async function (req, res, next) {
    const { projectId } = req.params;

    if (!projectId) {
        return next(new ApiError(400, "Project ID is required"));
    }

    try {
        const taskList = await Task.find({
            project: projectId
        }).sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(
                200,
                "Tasks fetched successfully",
                taskList
            )
        );
    } catch (error) {
        return next(error);
    }
};

export const getTasksById = async function (req, res, next) {
    const { taskId, projectId } = req.params;
    if (!taskId || !projectId) {
        return next(new ApiError(404, "The Project and the task must be determined"))
    }
    try {
        const taskAll = await Task.findOne({
            project: projectId,
            _id: taskId
        })
        if (!taskAll) {
            return next(new ApiError(404, "Task not found"));
        }
        res.status(200).json(new ApiResponse(200, "task found sucessfully", taskAll));
    } catch (error) {
        return next(error);
    }
}

export const updateTask = async function (req, res, next) {
    const { newTaskTitle, newTaskDesc, newAttachments, newStatus } = req.body;
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    if (!newTaskTitle && !newTaskDesc && !newAttachments && !newStatus) {
        return next(new ApiError(404, "No updation fields are provided to update"))
    }

    try {
        const updateData = {};

        if (newTaskTitle) updateData.title = newTaskTitle;
        if (newTaskDesc) updateData.description = newTaskDesc;
        if (newAttachments) updateData.attachments = newAttachments;
        if (newStatus) updateData.status = newStatus;

        const updatedTaskData = await Task.findOneAndUpdate(
            {
                project: projectId,
                _id: taskId
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedTaskData) {
            return next(new ApiError(404, "No task is updated"));
        }

        res.status(200).json(new ApiResponse(201, "The specific task data is updated", updatedTaskData));
    } catch (error) {
        next(error);
    }
}


export const deleteTask = async function (req, res, next) {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    if (!taskId || !projectId) {
        return next(new ApiError(404, "The Project and the task must be determined"))
    }

    try {
        const deletedTask = await Task.findOneAndDelete({
            project: projectId,
            _id: taskId
        })
        if (!deletedTask) {
            return next(new ApiError(404, "Task not found"));
        }

        return res.status(200).json(
            new ApiResponse(200, "Task deleted successfully", deletedTask)
        );
    } catch (error) {
        next(error);
    }
}