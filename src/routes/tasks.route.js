import express from "express"
import {addTask} from ""
export const taskRoutes = express.Router();

taskRoutes.post("/:projecgtId/task" , addTask);