import { format, parseISO } from "date-fns";
import enUS from "date-fns/locale/en-US";

import Mail from "../../lib/Mail";

class SubscriptionMail {
  get key() {
    return "SubscriptionMail";
  }

  // Handle the task to be executed
  async handle({ data }) {
    const { meetup, user } = data;

    return Mail.sendMail({
      to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
      subject: "New subscription",
      template: "subscription",
      context: {
        organizerName: meetup.organizer.name,
        userName: user.name,
        userEmail: user.email,
        meetupTitle: meetup.title,
        meetupDate: format(
          parseISO(meetup.date),
          "'on' iiii',' MMMM dd 'at' HH:mm '('zzzz')'",
          { locale: enUS }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
