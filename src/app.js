import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true, //ion know tf this does
  })
);
app.use(
  express.json({
    // to parse JSON bodies
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true, // to make nested objects work
  })
);
app.use(express.static("public")); // to keep static files like images, css, js in public folder
app.use(cookieParser()); // to parse cookies

// routes import
import router from "./routes/user.routes.js";
app.use("/api/users", router);

export default app;
