import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);    
app.use("/api/user", userRoute);
app.listen(3000, () => {

    console.log("Server running on port 3000");
})