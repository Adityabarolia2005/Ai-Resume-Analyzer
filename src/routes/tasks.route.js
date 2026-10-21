import express from "express"
import {addTask , getTasksInsideProject , getTasksById , updateTask, deleteTask} from "../controllers/task.controller.js"
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
    "/:projectId/task/:taskId/assignTask",
    authMiddleware,
    authorizationMiddleware("owner" , "project_admin"),
    assignTask
)