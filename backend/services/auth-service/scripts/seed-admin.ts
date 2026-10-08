import bcrypt from "bcryptjs";
import { UserRepository } from "../src/repositories/user.repository.js";

const email = process.env.ADMIN_EMAIL ?? "admin@society.com";
const password = process.env.ADMIN_PASSWORD ?? "Admin@1234";

const repo = new UserRepository();
if (await repo.findByEmail(email)) {
  console.log("Admin already exists");
} else {
  await repo.create({
    fullName: "Society Admin",
    email,
    mobile: "9000000000",
    flatNumber: "OFFICE",
    passwordHash: await bcrypt.hash(password, 10),
    role: "admin",
  });
  console.log(`Admin created: ${email}`);
}
process.exit(0);
