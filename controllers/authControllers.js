import * as authServices from "../services/authServices.js";
import { listContacts } from "../services/contactsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";

const registerController = async (req, res) => {
  const newUser = await authServices.registerUser(req.body);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
};

export const loginController = async (req, res) => {
  const newUser = await authServices.loginUser(req.body);

  res.status(201).json({
    token: newUser.token,
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

export const getCurrentController = async (req, res) => {
  const { email, id, subscription, avatarURL } = req.user;
  const contacts = await listContacts({ owner: id });

  res.status(200).json({
    email,
    subscription,
    avatarURL,
  });
};

export const logoutController = async (req, res) => {
  await authServices.logoutUser(req.user);
  res.status(204).end();
};

export const updateAvatar = async (req, res) => {
  const { id } = req.user;
  const avatarURL = await authServices.updateAvatar(id, req.file);

  res.status(200).json({
    avatarURL,
  });
};

const verifyController = async (req, res) => {
  const { verificationToken } = req.params;
  await authServices.verifyUser(verificationToken);

  res.json({
    message: "User verified",
  });
};

const resendVerifyController = async (req, res) => {
  await authServices.resendVerifyUser(req.body.email);

  res.json({
    message: "Verify email resend",
  });
};
export default {
  registerController: ctrlWrapper(registerController),
  loginController: ctrlWrapper(loginController),
  verifyController: ctrlWrapper(verifyController),
  resendVerifyController: ctrlWrapper(resendVerifyController),
  getCurrentController: ctrlWrapper(getCurrentController),
  logoutController: ctrlWrapper(logoutController),
  updateAvatar: ctrlWrapper(updateAvatar),
};
