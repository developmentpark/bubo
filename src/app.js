import { messages } from "./messages.js";

import { App } from "octokit";
import fs from "fs";
import ReviewService from "./reviewService.js";

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

async function handleCompletionChecks({ octokit, payload }) {
  try {
    const isAutoCheckPostMerge = payload["check_run"].pull_requests.length == 0;
    if (isAutoCheckPostMerge) {
      return;
    }

    const reviewService = new ReviewService({ octokit, payload });

    const hasReviewers = await reviewService.hasReviewers();
    if (hasReviewers) {
      const hasBotLikeReviewer = await reviewService.hasBotLikeReviewer();
      if (!hasBotLikeReviewer) {
        return;
      }
    }

    const isMergeable = await reviewService.isMergeable();

    const isChecksSuiteCompletedSuccess =
      await reviewService.isChecksSuiteCompletedSuccess();

    if (isMergeable && isChecksSuiteCompletedSuccess) {
      await reviewService.performAutoReview();
    }
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}

async function handleOpenPullRequest({ octokit, payload }) {
  try {
    const reviewService = new ReviewService({ octokit, payload });

    await reviewService.notifyPullRequestReception();

    const hasChecksSuite = await reviewService.hasChecksSuite();
    if (hasChecksSuite) {
      return;
    }

    const hasReviewers = await reviewService.hasReviewers();
    if (hasReviewers) {
      const hasBotLikeReviewer = await reviewService.hasBotLikeReviewer();
      if (!hasBotLikeReviewer) {
        return;
      }
    }

    const isMergeable = await reviewService.isMergeable();
    if (isMergeable) {
      await reviewService.performAutoReview();
    }
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}

async function handleAddingLabel({ octokit, payload }) {
  try {
    const reviewService = new ReviewService({ octokit, payload });

    const hasBotLikeReviewer = await reviewService.hasBotLikeReviewer();
    if (!hasBotLikeReviewer) {
      return;
    }
    const hasChecksSuite = await reviewService.hasChecksSuite();
    if (hasChecksSuite) {
      const isChecksSuiteCompletedSuccess =
        await reviewService.isChecksSuiteCompletedSuccess();
      if (!isChecksSuiteCompletedSuccess) {
        return;
      }
    }

    const isMergeable = await reviewService.isMergeable();
    if (isMergeable) {
      await reviewService.performAutoReview();
    }
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}

app.webhooks.on("pull_request.labeled", ({ octokit, payload }) => {
  console.log(
    `Received a pull request ${payload.action} event for #${payload.pull_request.number}`,
  );
  handleAddingLabel({ octokit, payload });
});

app.webhooks.on("pull_request.opened", ({ octokit, payload }) => {
  console.log(
    `Received a pull request event ${payload.action} for #${payload.pull_request.number}`,
  );
  handleOpenPullRequest({ octokit, payload });
});

app.webhooks.on("check_run.completed", ({ octokit, payload }) => {
  console.log(
    `Received a pull request event ${payload.action} for #${payload["check_run"].pull_requests[0].number}`,
  );
  handleCompletionChecks({ octokit, payload });
});

app.webhooks.onError((error) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

export { app };
