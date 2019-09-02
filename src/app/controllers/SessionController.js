import jwt from "jsonwebtoken";
import { promisify } from "util";

import User from "../models/User";
import authConfig from "../../config/auth";

class SessionController {
  async store(request, response) {
    // TODO: Data validation with Yup

    const { email, password } = request.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return response.status(401).json({ error: "User not found." });
      }

      if (!(await user.checkPassword(password))) {
        return response.status(401).json({ error: "Password does not match." });
      }

      const { id, name } = user;

      const token = await promisify(jwt.sign)({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      return response.json({
        user: {
          id,
          name,
          email,
        },
        token,
      });
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new SessionController();
