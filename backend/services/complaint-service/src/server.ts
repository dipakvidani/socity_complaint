import express from "express";
import { env } from "./config/env.js";
import { complaintRouter } from "./routes/complaint.routes.js";
import { internalAuth } from "./middleware/internalAuth.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(internalAuth);
app.use("/api/complaints", complaintRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => console.log(`Complaint service running on port ${env.port}`));
