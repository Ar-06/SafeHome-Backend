import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authRequires = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: "Token invalido" });
    }

    req.user = decoded;
    next();
  });
};
