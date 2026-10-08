import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { internalAuth } from "./middleware/internalAuth.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(internalAuth);
app.use("/api/auth", authRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => console.log(`Auth service running on port ${env.port}`));
