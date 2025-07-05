import HttpError from "../helpers/HttpError.js";

import { findUser } from "../services/authServices.js";

import { verifyToken } from "../helpers/jwt.js";

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization)
    return next(HttpError(401, "Authorization header missing"));
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer")
    return next(HttpError(401, "Authorization header not Bearer"));

  const { payload, error } = verifyToken(token);
  if (error) return next(HttpError(401, error.message));
  const user = await findUser({ id: payload.id });
  if (!user || !user.token) return next(HttpError(401, "User not found"));
  req.user = user;
  next();
};
export default authenticate;
