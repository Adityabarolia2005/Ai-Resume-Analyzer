import { app } from "./app.js"
import { connectDB } from "./db/connectDb.js"\
import {apiError} from "./utility/apiError.js"
import "dotenv/config"

const port = process.env.PORT || 3000;

await connectDB().then(
    () => {
        app.listen(port, () => {
            console.log(`The server is running in the port : ${port}`);
        })
        console.log(`The server is running on port ${port}`);
    }
).catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
