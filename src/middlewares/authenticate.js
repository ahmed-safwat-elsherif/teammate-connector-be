import { verifyAccessToken } from "../utils/jwtUtils.js";

export default (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.sendStatus(401);
    }
    const result = verifyAccessToken(token);
    if (!result.success) {
      return res.status(403).json({ message: "Authentication is required!" });
    }
    req.user = result.data;
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
