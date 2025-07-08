import bcrypt from "bcrypt";
import User from "../db/User.js";
import gravatar from "gravatar";
import { rename } from "node:fs/promises";
import { resolve, join } from "node:path";
const avatarDir = resolve("public", "avatars");
import HttpError from "../helpers/HttpError.js";
import sendEmail from "../helpers/sendEmail.js";
import { createToken } from "../helpers/jwt.js";
import { nanoid } from "nanoid";
const { APP_DOMAIN } = process.env;
export const findUser = (query) =>
  User.findOne({
    where: query,
  });

const createVerifyEmail = ({ email, verificationToken }) => ({
  to: email,
  subject: "Verify email",
  html: `<a href="${APP_DOMAIN}/api/auth/verify/${verificationToken}" target="_blank">Click verify email</a>`,
});
export const registerUser = async (payload) => {
  const verificationToken = nanoid();
  const hashPassword = await bcrypt.hash(payload.password, 10);
  const avatarURL = gravatar.url(payload.email, { s: "250", d: "identicon" });

  const user = await User.create({
    ...payload,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = createVerifyEmail({
    email: payload.email,
    verificationToken,
  });

  await sendEmail(verifyEmail);

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) throw HttpError(401, "Email or password is wrong");
  if (!user.verify) throw (401, "Email not verified");
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) throw HttpError(401, "Email or password is wrong");

  const payload = {
    id: user.id,
  };

  const token = createToken(payload);
  user.token = token;
  await user.save();
  return user;
};
export const logoutUser = async ({ id }) => {
  const user = await findUser({ id });
  if (!user) throw HttpError(401, "User not found");
  user.token = "";
  await user.save();
};

export const updateAvatar = async (id, file) => {
  let avatarURL = null;
  const user = await findUser({ id });
  if (!user) throw HttpError(401, "User not found");
  if (!file) throw HttpError(400, "Avatar not uploaded");

  const { path: oldPath, filename } = file;
  const newPath = join(avatarDir, filename);
  await rename(oldPath, newPath);
  avatarURL = join("avatars", filename);
  user.avatarURL = avatarURL;
  await user.save();

  return avatarURL;
};

export const verifyUser = async (verificationToken) => {
  const user = await findUser({ verificationToken });
  if (!user) throw HttpError(401, "Email not found or already verified");

  return user.update({ verify: true, verificationToken: null });
};

export const resendVerifyUser = async (email) => {
  const user = await findUser({ email });
  if (!user || user.verify)
    throw HttpError(401, "Email not found or already verified");

  const verifyEmail = createVerifyEmail({
    email,
    verificationToken: user.verificationToken,
  });

  await sendEmail(verifyEmail);
};
