import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { addProjectMember, getProjectMembers, deleteMember ,updateMember} from "../controllers/projectMember.controller.js";

const projectMemberRoute = express.Router();

projectMemberRoute.post("/:projectId/members", authMiddleware,authorizationMiddleware("owner"), addProjectMember);
projectMemberRoute.get("/:projectId/members", authMiddleware,authorizationMiddleware("owner", "project_admin", "member"), getProjectMembers);
projectMemberRoute.delete("/:projectId/member/:userId",authMiddleware,authorizationMiddleware("owner" , "project_admin"),deleteMember);
projectMemberRoute.patch("/:projectId/members/:memberId",authMiddleware,authorizationMiddleware("owner"),updateMember
);
export default projectMemberRoute;
