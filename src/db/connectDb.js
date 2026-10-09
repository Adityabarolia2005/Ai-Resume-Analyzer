import mongoose from "mongoose"
import "dotenv/config"
export async function connectDB(){
    const db = await mongoose.connect(process.env.DB_URL);
    console.log(`The database has spinned in port : ${mongoose.connection.port}`);
}