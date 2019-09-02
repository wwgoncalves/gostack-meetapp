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
}

export default new UserController();
