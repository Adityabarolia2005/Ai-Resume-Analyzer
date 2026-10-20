import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/response.js"
import { ProjectMember } from "../models/projectMember.model.js";
import { Project } from "../models/project.model.js";

export const authorizationMiddleware = (...allowedRoles) => {
    return async function (req, res, next) {
        const { projectId } = req.params;
        const userId = req.user.id;  //id of the authoried user 
        if (!projectId) {
            return next(new ApiError(400, "The project is not selected"));
        }
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                return next(new ApiError(404, "Project not found"));
            }
            if (project.createdBy.toString() === userId) {
                //that means the current authorized userr is the owner of this project 
                if (!allowedRoles.includes("owner")) {
                    return next(new ApiError(403, "You are not allowed to perform this action"));
                }
                req.roles = "owner";
                req.project = project;
                return next();
            }
            else {
                //When the current loged in user is not the owner then we need to find its member 
                const member = await ProjectMember.findOne({
                    project: projectId,
                    userId
                });
                if (!member) {
                    return next(new ApiError(400, "There is no member in this project"));
                }
                if (!allowedRoles.includes(member.role)) {
                    return next(new ApiError(403, "You do not have permission for this action"));
                }

                req.project = project;
                req.projectMember = member;
                req.projectRole = member.role;
                next();
            }
        }
        catch (error) {
            next(error);
        }
    }
}