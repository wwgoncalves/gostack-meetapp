import { isBefore } from "date-fns";
import { Op } from "sequelize";

import Subscription from "../models/Subscription";
import Meetup from "../models/Meetup";
import User from "../models/User";
import File from "../models/File";

import SubscriptionMail from "../jobs/SubscriptionMail";
import Queue from "../../lib/Queue";

class SubscriptionController {
  async index(request, response) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: request.userId,
      },
      include: {
        model: Meetup,
        as: "meetup",
        where: {
          date: {
            [Op.gt]: new Date(),
          },
        },
        attributes: ["title", "description", "location", "date"],
        include: [
          {
            model: User,
            as: "organizer",
            attributes: ["name", "email"],
          },
          {
            model: File,
            as: "banner",
            attributes: ["name", "path", "url"],
          },
        ],
      },
      order: [["meetup", "date", "ASC"]],
      attributes: ["id", "created_at", "meetup_id"],
    });

    return response.json(subscriptions);
  }

  async store(request, response) {
    const meetup = await Meetup.findByPk(request.params.meetupId, {
      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["name", "email"],
        },
      ],
    });

    if (!meetup) {
      return response.status(400).json({ error: "Meetup not found." });
    }

    if (meetup.user_id === request.userId) {
      return response
        .status(403)
        .json({ error: "Organizers cannot subscribe to their own meetups." });
    }

    if (isBefore(meetup.date, new Date())) {
      return response
        .status(400)
        .json({ error: "Users cannot subscribe to past meetups." });
    }

    const alreadySubscribed = await Subscription.findOne({
      where: {
        meetup_id: request.params.meetupId,
        user_id: request.userId,
      },
    });

    if (alreadySubscribed) {
      return response
        .status(400)
        .json({ error: "Users cannot subscribe twice to a meetup." });
    }

    const timeConflict = await Subscription.findOne({
      where: {
        user_id: request.userId,
      },
      attributes: ["meetup_id"],
      include: [
        {
          model: Meetup,
          as: "meetup",
          required: true,
          where: {
            date: meetup.date,
          },
          attributes: ["id"],
        },
      ],
    });

    if (timeConflict) {
      return response.status(400).json({
        error: "Users cannot subscribe to meetups that occur at a same time.",
      });
    }

    const subscription = await Subscription.create({
      meetup_id: request.params.meetupId,
      user_id: request.userId,
    });

    /**
     * Send an e-mail to the organizer notifying them the subscription
     */
    const user = await User.findByPk(request.userId);
    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return response.status(201).json(subscription);
  }
}

export default new SubscriptionController();
