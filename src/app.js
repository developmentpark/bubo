import OctokitService from "./octokitService.js";
import { messages } from "./messages.js";

import { App } from "octokit";
import fs from "fs";
import {
  notifyPullRequestReception,
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

async function handleCompletionChecks({ octokit, payload }) {
  try {
    const isAutoCheckPostMerge = payload["check_run"].pull_requests.length == 0;
    if (isAutoCheckPostMerge) {
      return;
    }

    const octokitService = new OctokitService({ octokit, payload });

    const checkRun = payload["check_run"];

    const checkSuite = checkRun["check_suite"];

    const reviewers = await octokitService.getReviewers();
    const hasReviewers = reviewers.length > 0;
    if (hasReviewers) {
      const selfReviewLabel = "bubo";
      const isSelfReview = await octokitService.isLabel(selfReviewLabel);
      if (!isSelfReview) {
        return;
      }
    }

    const mergeInfo = await octokitService.getMergeInfo();
    const isMergeable =
      !mergeInfo.merged && mergeInfo.mergeable && mergeInfo.state == "clean";
    const isChecksSuiteCompleted =
      checkSuite.status == "completed" && checkSuite.conclusion == "success";

    if (!isMergeable || !isChecksSuiteCompleted) {
      return;
    }

    performAutoReview({ octokit, payload });
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
    const octokitService = new OctokitService({ octokit, payload });

    await notifyPullRequestReception({ octokit, payload });

    const checksSuiteInfo = await octokitService.getChecksSuiteInfo();
    const hasCheckers = checksSuiteInfo["total_count"] > 0;
    if (hasCheckers) {
      return;
    }

    const reviewers = await octokitService.getReviewers();
    const hasReviewers = reviewers.length > 0;
    if (hasReviewers) {
      const selfReviewLabel = "bubo";
      const isSelfReview = await octokitService.isLabel(selfReviewLabel);
      if (!isSelfReview) {
        return;
      }
    }

    const mergeInfo = await octokitService.getMergeInfo();
    const isMergeable =
      !mergeInfo.merged && mergeInfo.mergeable && mergeInfo.state == "clean";
    if (!isMergeable) {
      return;
    }

    performAutoReview({ octokit, payload });
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
    const octokitService = new OctokitService({ octokit, payload });

    const selfReviewLabel = "bubo";
    const isSelfReview = await octokitService.isLabel(selfReviewLabel);
    if (!isSelfReview) {
      return;
    }

    const checksSuiteInfo = await octokitService.getChecksSuiteInfo();
    const hasChecksSuite = checksSuiteInfo["total_count"] > 0;
    if (hasChecksSuite) {
      const isChecksSuiteCompleted = !checksSuiteInfo["check_suites"].some(
        ({ status, conclusion }) =>
          status != "completed" || conclusion != "success",
      );
      if (!isChecksSuiteCompleted) {
        return;
      }
    }

    const mergeInfo = await octokitService.getMergeInfo();
    const isMergeable =
      !mergeInfo.merged && mergeInfo.mergeable && mergeInfo.state == "clean";
    if (!isMergeable) {
      return;
    }

    performAutoReview({ octokit, payload });
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
    `Received a pull request event ${payload.action} for #${payload.pull_request.number}`,
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
