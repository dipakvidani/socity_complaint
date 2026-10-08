import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import amqp from "amqplib";
import { env } from "../config.js";
import { readAccessToken } from "../middleware/auth.middleware.js";

const EXCHANGE = "complaint.events";

export class SocketHandler {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, { cors: { origin: env.clientUrl, credentials: true } });
    this.io.use((socket, next) => {
      const raw = socket.handshake.headers.cookie ?? "";
      const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith("access_token="));
      const user = readAccessToken(match ? decodeURIComponent(match.slice("access_token=".length)) : undefined);
      if (!user) return next(new Error("Please log in to continue."));
      socket.data.user = user;
      next();
    });
    this.io.on("connection", (socket) => {
      const user = socket.data.user;
      socket.join(`user:${user.userId}`);
      if (user.role === "admin") socket.join("admins");
    });
  }

  async listen() {
    try {
      const connection = await amqp.connect(env.rabbitUrl);
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, "topic", { durable: true });
      const { queue } = await channel.assertQueue("", { exclusive: true });
      await channel.bindQueue(queue, EXCHANGE, "complaint.*");
      await channel.consume(queue, (msg) => {
        if (!msg) return;
        this.broadcast(msg.fields.routingKey, JSON.parse(msg.content.toString()));
        channel.ack(msg);
      });
      connection.on("close", () => setTimeout(() => this.listen(), 5000));
      console.log("Gateway is listening for complaint events");
    } catch {
      console.warn("RabbitMQ is not reachable, live updates are off. Retrying in 5 seconds.");
      setTimeout(() => this.listen(), 5000);
    }
  }

  private broadcast(event: string, data: { residentId?: number }) {
    let target = this.io.to("admins");
    if (data.residentId) target = target.to(`user:${data.residentId}`);
    target.emit(event, data);
  }
}
