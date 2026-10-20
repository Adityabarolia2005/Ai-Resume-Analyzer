import express from "express"
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const projectRoutes = express.Router();

projectRoutes.get("/" , authMiddleware , getProjects)
projectRoutes.post("/createProject" , authMiddleware ,  createProject);
projectRoutes.get("/:projectId", authMiddleware, getProjectById);
projectRoutes.patch("/:projectId" , authMiddleware , updateProject);
export default projectRoutes;
