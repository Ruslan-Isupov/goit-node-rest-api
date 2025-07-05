import bcrypt from "bcrypt";
import { createToken } from "../helpers/jwt.js";
import User from "../db/User.js";

import HttpError from "../helpers/HttpError.js";

export const findUser = (query) =>
  User.findOne({
    where: query,
  });

export const registerUser = async (payload) => {
  const hashPassword = await bcrypt.hash(payload.password, 10);
  return User.create({ ...payload, password: hashPassword });
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) throw HttpError(401, "Email or password is wrong");

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
