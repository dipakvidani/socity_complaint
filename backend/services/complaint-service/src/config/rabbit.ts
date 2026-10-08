import amqp from "amqplib";
import { env } from "./env.js";

export const EXCHANGE = "complaint.events";

export class EventPublisher {
  private channel: amqp.Channel | null = null;
  private connecting: Promise<void> | null = null;

  private async connect() {
    const connection = await amqp.connect(env.rabbitUrl);
    connection.on("error", () => (this.channel = null));
    connection.on("close", () => (this.channel = null));
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    this.channel = channel;
  }

  async publish(event: string, payload: object) {
    try {
      if (!this.channel) {
        this.connecting ??= this.connect().finally(() => (this.connecting = null));
        await this.connecting;
      }
      this.channel?.publish(EXCHANGE, event, Buffer.from(JSON.stringify(payload)), { persistent: true });
    } catch {
      console.warn(`Could not publish ${event}. Is RabbitMQ running?`);
    }
  }
}
