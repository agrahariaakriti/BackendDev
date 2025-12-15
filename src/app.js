//  ☠️☠️☠️☠️☠️ VERY IMPORTANT ☠️☠️☠️☠️☠️☠️
// app.js → SERVER + GLOBAL CONFIG
// This file:
// ⭐ creates the Express server
// ⭐ registers global middleware
// ⭐ mounts routers
// ⭐ exposes API entry points

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Regstering middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes would be used here. Calling all the route here

import userRoutes from "./routes/user.routes.js";

// Routes declaration.

//⭐ Internally, this line is creating an API entry point.
//⭐ This line means app.use('/api/v1/users', userRoutes);
//⭐ Means: “Any request starting with /api/v1/users → send it to userRoutes”
app.use("/api/v1/users", userRoutes);

export { app };
