import * as Yup from "yup";

import User from "../models/User";

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(request.body))) {
      return response
        .status(400)
        .json({ error: "Invalid data. Schema validation has failed." });
    }

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
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      ),
    });

    if (!(await schema.isValid(request.body))) {
      return response
        .status(400)
        .json({ error: "Invalid data. Schema validation has failed." });
    }

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
  }
}

export default new UserController();
