import * as Yup from "yup";
import { isBefore, parseISO } from "date-fns";

import Meetup from "../models/Meetup";

class MeetupController {
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

    const parsedDate = parseISO(request.body.date);

    if (isBefore(parsedDate, new Date())) {
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
