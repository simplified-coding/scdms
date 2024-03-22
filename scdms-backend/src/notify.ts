import axios from "axios";

export const sendNotification = async (
  title: string,
  body: string,
  author?: string,
) => {
  axios.post(process.env.NOTIFY_DISCORD_WEBHOOK, {
    embeds: [
      {
        title: title,
        description: body,
        type: "rich",
        footer: {
          text: author
            ? `This action was triggered by ${author}`
            : "This is an automated log message by SCDMS",
        },
      },
    ],
  });
};
