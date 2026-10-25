import { ApiError } from "../utility/apiError.js";
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utility/response.js";
import { ProjectMember } from "../models/projectMember.model.js";

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
        })
            .populate("assignedTo", "userName email")
            .sort({ createdAt: -1 });

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

export const getTasksAssignedToUser = async function (req, res, next) {
    try {
        const assignedTasks = await Task.find({
            assignedTo: req.user.id
        })
            .populate("project", "name description")
            .populate("createdBy", "userName email")
            .populate("assignedTo", "userName email")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(
                200,
                "Assigned tasks fetched successfully",
                assignedTasks
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

export const assignTask = async function (req, res, next) {
    const { projectId, taskId } = req.params;
    const { userId } = req.body;

    if (!projectId || !taskId || !userId) {
        return next(new ApiError(400, "Project ID, task ID, and user ID are required"));
    }

    try {
        const targetIsOwner = req.project.createdBy.toString() === userId;

        if (!targetIsOwner) {
            const projectMember = await ProjectMember.findOne({
                project: projectId,
                userId
            });

            if (!projectMember) {
                return next(new ApiError(404, "User is not a member of this project"));
            }
        }

        const assignedTask = await Task.findOneAndUpdate(
            {
                _id: taskId,
                project: projectId
            },
            {
                $set: { assignedTo: userId }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("assignedTo", "userName email");

        if (!assignedTask) {
            return next(new ApiError(404, "Task not found in this project"));
        }

        return res.status(200).json(
            new ApiResponse(200, "Task assigned successfully", assignedTask)
        );
    } catch (error) {
        return next(error);
    }
};

export const changeTaskStatus = async function (req, res, next) {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;
    const { newStatus } = req.body;

    if (!newStatus || !["todo", "in_progress", "done"].includes(newStatus)) {
        return next(new ApiError(400, "A valid task status is required"));
    }

    try {
        const task = await Task.findOne({
            _id: taskId,
            project: projectId
        })
        if (!task) {
            return next(new ApiError(404, "Task not found in this project"));
        }

        const isManager = req.roles === "owner" || req.projectRole === "project_admin";
        const isAssignee = task.assignedTo && task.assignedTo.toString() === userId;

        if (!isManager && !isAssignee) {
            return next(new ApiError(403, "The user are not allow to change the status of the task"));
        }
        const updatedStatus = await Task.findOneAndUpdate({
            _id: taskId,
            project: projectId
        },
            {
                $set: {
                    status: newStatus
                }
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("project", ["name description"])
            .populate("createdBy", ["userName email"])
            .populate("assignedTo", ["userName email"]);

        if (!updatedStatus) {
            return next(new ApiError(400, "Task cann't be found to update the status"))
        }

        return res.status(200).json(
            new ApiResponse(200, "The task status has been updated", updatedStatus)
        );
    } catch (error) {
        return next(error);
    }
}
