import Meetup from "../models/Meetup";
import File from "../models/File";

class ArrangementController {
  async index(request, response) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: request.userId,
      },
      include: [
        {
          model: File,
          as: "banner",
          attributes: ["name", "path", "url"],
        },
      ],
    });

    return response.json(meetups);
  }
}

export default new ArrangementController();
