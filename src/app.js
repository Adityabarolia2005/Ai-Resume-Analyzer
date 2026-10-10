import express from "express"
import cors from "cors"
import "dotenv/config"
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cors({
    origin : process.env.CORS_URL,
    credentials:true
}))
app.get('/healthCheck' , (req , res)=>{
    res.status(200).json({
        message : "Health check is done completely !!",
        success: true
    })
})

app.use("/api/v1/auth", authRoutes);



app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    statusCode: error.statusCode || 500,
    success: false,
    message: error.message || "Internal server error",
  });
});
export {app}
