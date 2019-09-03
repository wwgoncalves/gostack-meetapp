import jwt from "jsonwebtoken";
import { promisify } from "util";

import authConfig from "../../config/auth";

export default async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ error: "Token must be provided." });
  }

  const [, token] = authHeader.split(" ");
  if (!token) {
    return response.status(401).json({ error: "Token must be provided." });
  }

  try {
    const decodedPayload = await promisify(jwt.verify)(
      token,
      authConfig.secret
    );

    request.userId = decodedPayload.id;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return response.status(401).json({ error: "Token has expired." });
    }
    return response.status(401).json({ error: "Invalid token." });
  }
};
