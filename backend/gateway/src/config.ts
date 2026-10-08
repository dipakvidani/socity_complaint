import "dotenv/config";

const need = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing setting: ${key}`);
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  authServiceUrl: need("AUTH_SERVICE_URL"),
  complaintServiceUrl: need("COMPLAINT_SERVICE_URL"),
  rabbitUrl: process.env.RABBITMQ_URL ?? "amqp://localhost",
  accessJwtSecret: need("ACCESS_JWT_SECRET"),
  internalJwtSecret: need("INTERNAL_JWT_SECRET"),
};
