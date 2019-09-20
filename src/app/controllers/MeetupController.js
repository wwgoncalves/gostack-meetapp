import * as Yup from "yup";
import { startOfDay, endOfDay, isBefore, parseISO } from "date-fns";
import { Op } from "sequelize";

import Meetup from "../models/Meetup";
import User from "../models/User";
import File from "../models/File";

class MeetupController {
  async index(request, response) {
    const { date = new Date().toISOString(), page = 1 } = request.query;

    const parsedDate = parseISO(date);

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ["date"],
      limit: process.env.PAGE_SIZE,
      offset: (page - 1) * process.env.PAGE_SIZE,
      include: [
        {
          model: File,
          as: "banner",
          attributes: ["name", "path", "url"],
        },
        {
          model: User,
          as: "organizer",
          attributes: ["name", "email"],
        },
      ],
    });

    return response.json(meetups);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response
        .status(400)
        .json({ error: "Invalid data. Schema validation has failed." });
    }

    if (isBefore(parseISO(request.body.date), new Date())) {
      return response.status(400).json({ error: "Past dates are forbidden." });
    }

    const meetup = await Meetup.create({
      ...request.body,
      user_id: request.userId,
    });

    return response.status(201).json(meetup);
  }
}

export default new MeetupController();
