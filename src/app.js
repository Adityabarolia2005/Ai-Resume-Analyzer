import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import cookieParser from "cookie-parser";
import projectMemberRoute from "./routes/projectMember.routes.js"
import { taskRoutes } from "./routes/tasks.route.js";

const app = express();
const allowedOrigins = new Set([
    process.env.CORS_URL,
    "http://localhost:5173",
    "http://localhost:5174"
].filter(Boolean));

app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, origin || true);
        }
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
}))
app.use(cookieParser());

app.get('/healthCheck' , (req , res)=>{
    res.status(200).json({
        message : "Health check is done completely !!",
        success: true
    })
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project" , projectRoutes);
app.use("/api/v1/projectMember" , projectMemberRoute);
app.use("/api/v1/project",taskRoutes);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    statusCode: error.statusCode || 500,
    success: false,
    message: error.message || "Internal server error",
    stack: error.stack
  });
});
export {app}
