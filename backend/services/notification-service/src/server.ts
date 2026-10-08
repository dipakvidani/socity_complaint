import "dotenv/config";
import amqp from "amqplib";
import dayjs from "dayjs";

const EXCHANGE = "complaint.events";
const QUEUE = "notification.worker";
const url = process.env.RABBITMQ_URL ?? "amqp://localhost";

const messageFor = (event: string, data: Record<string, any>) => {
  switch (event) {
    case "complaint.created":
      return `Email to society office: new ${data.priority} priority complaint "${data.title}" from ${data.residentName} (${data.flatNumber}).`;
    case "complaint.updated":
      return `SMS to ${data.residentName}: your complaint "${data.title}" is now ${String(data.status).replace("_", " ")}.`;
    case "complaint.commented":
      return `Email: new comment on "${data.title}" from ${data.authorName}.`;
    default:
      return `Unknown event ${event}`;
  }
};

const start = async () => {
  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, EXCHANGE, "complaint.*");
    console.log("Notification service is listening for complaint events");

    await channel.consume(QUEUE, (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      console.log(`[${dayjs().format("DD MMM YYYY HH:mm:ss")}] ${messageFor(msg.fields.routingKey, data)}`);
      channel.ack(msg);
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed. Retrying in 5 seconds.");
      setTimeout(start, 5000);
    });
  } catch {
    console.warn("RabbitMQ is not reachable. Retrying in 5 seconds.");
    setTimeout(start, 5000);
  }
};

start();
