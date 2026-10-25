import express from "express"
import { addTask, getTasksInsideProject, getTasksAssignedToUser, getTasksById, updateTask, deleteTask, assignTask , changeTaskStatus} from "../controllers/task.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
export const taskRoutes = express.Router();

taskRoutes.post(
    "/:projectId/tasks",
    authMiddleware,
    authorizationMiddleware("owner", "project_admin"),
    addTask
);
taskRoutes.get(
    "/:projectId/tasks",
    authMiddleware,
    authorizationMiddleware("owner" , "project_admin"),
    getTasksInsideProject
)

taskRoutes.get(
    "/tasks/assigned",
    authMiddleware,
    getTasksAssignedToUser
)

taskRoutes.get(
    "/:projectId/task/:taskId",
    authMiddleware,
    authorizationMiddleware("owner" , "project_admin"),
    getTasksById
)

taskRoutes.patch(
    "/:projectId/task/:taskId",
    authMiddleware,
    authorizationMiddleware("owner" , "project_admin"),
    updateTask
)

taskRoutes.delete(
    "/:projectId/task/:taskId",
    authMiddleware,
    authorizationMiddleware("owner" , "project_admin"),
    deleteTask
)

taskRoutes.patch(
    "/:projectId/tasks/:taskId/assign",
    authMiddleware,
    authorizationMiddleware("owner" , "project_admin"),
    assignTask
)

taskRoutes.patch(
    "/:projectId/task/:taskId/status",
    authMiddleware,
    authorizationMiddleware("owner","project_admin","member"),
    changeTaskStatus
)