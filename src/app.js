import { App } from "octokit";
import fs from "fs";
import {
  performAutoReview,
  performAutoReviewByLabeled,
} from "./reviewService.js";

const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;

const privateKey = fs.readFileSync(privateKeyPath, "utf8");

const app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

async function handlePullRequestOpened({ octokit, payload }) {
  console.log(
    `Received a pull request event for #${payload.pull_request.number}`,
  );
  try {
    await performAutoReview({ octokit, payload });
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}

async function handlePullRequestLabeled({ octokit, payload }) {
  console.log(
    `Received a pull request ${payload.action} event for #${payload.pull_request.number}`,
  );
  if (
    payload.pull_request.state !== "open" ||
    payload.pull_request.merged !== false
  ) {
    return;
  }
  try {
    await performAutoReviewByLabeled({ octokit, payload });
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}

app.webhooks.on("pull_request.labeled", handlePullRequestLabeled);

app.webhooks.on("pull_request.opened", handlePullRequestOpened);

app.webhooks.onError((error) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

export { app };
