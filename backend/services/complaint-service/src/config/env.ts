import "dotenv/config";

const need = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing setting: ${key}`);
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 5002),
  db: {
    host: need("DB_HOST"),
    port: Number(need("DB_PORT")),
    user: need("DB_USER"),
    password: need("DB_PASSWORD"),
    name: need("DB_NAME"),
  },
  cloudinary: {
    name: need("CLOUDINARY_NAME"),
    key: need("CLOUDINARY_API_KEY"),
    secret: need("CLOUDINARY_API_SECRET"),
  },
  internalJwtSecret: need("INTERNAL_JWT_SECRET"),
  rabbitUrl: process.env.RABBITMQ_URL ?? "amqp://localhost",
};
