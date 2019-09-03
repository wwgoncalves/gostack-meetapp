import User from "../models/User";

class UserController {
  async store(request, response) {
    // TODO: Data validation with Yup

    try {
      const userExists = await User.findOne({
        where: { email: request.body.email },
      });

      if (userExists) {
        return response.status(400).json({ error: "User already exists." });
      }

      const { id, name, email } = await User.create(request.body);

      return response.status(201).json({
        id,
        name,
        email,
      });
    } catch (error) {
      return response.status(500).json({ error });
    }
  }

  async update(request, response) {
    // TODO: Data validation with Yup

    // These fields may be updated: name, email, password (requires: oldPassword and confirmPassword)

    try {
      const user = await User.findByPk(request.userId);
      const { email, oldPassword } = request.body;

      // Is the new e-mail already in use?
      if (email && email !== user.email) {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
          return response.status(400).json({ error: "User already exists." });
        }
      }

      // Is the (old)password provided correct?
      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return response
          .status(401)
          .json({ error: "Current password does not match." });
      }

      const userUpdated = await user.update(request.body);

      return response.status(200).json({
        id: userUpdated.id,
        name: userUpdated.name,
        email: userUpdated.email,
      });
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new UserController();
