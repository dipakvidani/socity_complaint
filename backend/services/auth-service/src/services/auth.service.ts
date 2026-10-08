import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { env } from "../config/env.js";
import { uploadImage } from "../config/cloudinary.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { AppError } from "../utils/AppError.js";
import type { User } from "../models/user.model.js";

export const ACCESS_TTL_MS = 15 * 60 * 1000;
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SESSION_ENDED = "Your session has ended. Please log in again.";
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const toPublicUser = (u: User) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  mobile: u.mobile,
  flatNumber: u.flatNumber,
  avatarUrl: u.avatarUrl,
  role: u.role,
  createdAt: dayjs(u.createdAt).toISOString(),
});

export class AuthService {
  constructor(
    private users = new UserRepository(),
    private tokens = new RefreshTokenRepository()
  ) {}

  async register(input: { fullName: string; email: string; mobile: string; flatNumber: string; password: string }, avatar?: Buffer) {
    if (await this.users.findByEmail(input.email)) {
      throw new AppError(409, "An account with this email already exists. Try logging in instead.", {
        email: "This email is already registered.",
      });
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const avatarUrl = avatar ? await uploadImage(avatar, "avatars") : null;
    const user = await this.users.create({
      fullName: input.fullName,
      email: input.email,
      mobile: input.mobile,
      flatNumber: input.flatNumber,
      passwordHash,
      avatarUrl,
      role: "resident",
    });
    return toPublicUser(user!);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !ok) throw new AppError(401, "Email or password is not correct.");
    return { user: toPublicUser(user), ...(await this.issueTokens(user)) };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new AppError(401, SESSION_ENDED);
    let payload: { sub: string };
    try {
      payload = jwt.verify(refreshToken, env.refreshJwtSecret) as { sub: string };
    } catch {
      throw new AppError(401, SESSION_ENDED);
    }
    const hash = hashToken(refreshToken);
    const stored = await this.tokens.findValid(hash);
    const user = await this.users.findById(Number(payload.sub));
    if (!stored || !user) throw new AppError(401, SESSION_ENDED);
    await this.tokens.remove(hash);
    return this.issueTokens(user);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) await this.tokens.remove(hashToken(refreshToken));
  }

  async me(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) throw new AppError(404, "We could not find your account.");
    return toPublicUser(user);
  }

  async updateProfile(userId: number, input: { fullName: string; mobile: string; flatNumber: string }) {
    const user = await this.users.updateProfile(userId, input);
    if (!user) throw new AppError(404, "We could not find your account.");
    return { user: toPublicUser(user), accessToken: this.signAccess(user) };
  }

  async updateAvatar(userId: number, file?: Buffer) {
    if (!file) throw new AppError(400, "Please choose a photo to upload.", { avatar: "Choose a photo first." });
    const url = await uploadImage(file, "avatars");
    const user = await this.users.updateAvatar(userId, url);
    return toPublicUser(user!);
  }

  private signAccess(user: User) {
    return jwt.sign({ sub: String(user.id), role: user.role, name: user.fullName, flat: user.flatNumber }, env.accessJwtSecret, { expiresIn: "15m" });
  }

  private async issueTokens(user: User) {
    const accessToken = this.signAccess(user);
    const refreshToken = jwt.sign({ sub: String(user.id), jti: crypto.randomUUID() }, env.refreshJwtSecret, { expiresIn: "7d" });
    await this.tokens.save(user.id, hashToken(refreshToken), dayjs().add(REFRESH_TTL_MS, "millisecond").toDate());
    return { accessToken, refreshToken };
  }
}
