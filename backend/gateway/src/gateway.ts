import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config.js";
import { gatewayRouter } from "./routes/gateway.routes.js";
import { SocketHandler } from "./socket/socket.handler.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "You are going a little too fast. Please slow down.", data: null, meta: null },
  })
);
app.use("/api", gatewayRouter);
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "We could not find what you were looking for.", data: null, meta: null });
});

const server = http.createServer(app);
const sockets = new SocketHandler(server);
void sockets.listen();

server.listen(env.port, () => console.log(`Gateway running on port ${env.port}`));
