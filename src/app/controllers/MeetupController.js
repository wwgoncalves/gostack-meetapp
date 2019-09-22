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

  async update(request, response) {
    const meetup = await Meetup.findByPk(request.params.id);

    if (!meetup) {
      return response.status(400).json({ error: "Meetup not found." });
    }

    if (meetup.user_id !== request.userId) {
      return response.status(403).json({
        error: "Only the meetup organizer can edit its information.",
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return response
        .status(400)
        .json({ error: "Past events cannot be edited." });
    }

    const meetupUpdated = await meetup.update(request.body);

    return response.json(meetupUpdated);
  }

  async delete(request, response) {
    const meetup = await Meetup.findByPk(request.params.id);

    if (!meetup) {
      return response.status(400).json({ error: "Meetup not found." });
    }

    if (meetup.user_id !== request.userId) {
      return response.status(403).json({
        error: "Only the meetup organizer can delete this meetup.",
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return response
        .status(400)
        .json({ error: "Past events cannot be deleted." });
    }

    await meetup.destroy();

    return response.status(204).end();
  }
}

export default new MeetupController();
