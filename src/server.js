import http from "http";
import { createNodeMiddleware } from "@octokit/webhooks";
import { app } from "./app.js";

const port = process.env.PORT || 3000;
const host = process.env.HOST;
const path = "/api/webhook";
const localWebhookUrl = `http://${host}:${port}${path}`;

const middleware = createNodeMiddleware(app.webhooks, { path });

http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log("Press Ctrl + C to quit.");
});
