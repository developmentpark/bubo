import { App } from "octokit";
import fs from "fs";

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

const messageForNewPRs =
  "Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.";
const messageForResolveAutoReview =
  "Great job! The review has been approved and successfully merged. Let's keep building together!";
const messageForRejectAutoReview =
  "Automatic review was not performed as a reviewer has already been manually assigned to the pull request. Manual review is underway.";

async function getReviewers({ octokit, payload }) {
  const res = await octokit.rest.pulls.listRequestedReviewers({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    pull_number: payload.pull_request.number,
  });
  return res.data.users;
}

async function isApprovedToAutoReview({ octokit, payload }) {
  const reviewers = await getReviewers({ octokit, payload });
  return reviewers.length === 0;
}

async function handlePullRequestOpened({ octokit, payload }) {
  console.log(
    `Received a pull request event for #${payload.pull_request.number}`,
  );

  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: messageForNewPRs,
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      },
    );

    const isAutoReviewApproved = await isApprovedToAutoReview({
      octokit,
      payload,
    });

    if (!isAutoReviewApproved) {
      console.log(messageForRejectAutoReview);
      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.pull_request.number,
          body: messageForRejectAutoReview,
          headers: {
            "x-github-api-version": "2022-11-28",
          },
        },
      );
    }
    await octokit.rest.pulls.createReview({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
      body: messageForResolveAutoReview,
      event: "APPROVE",
    });

    await octokit.rest.pulls.merge({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
    });
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}

app.webhooks.on("pull_request.opened", handlePullRequestOpened);

app.webhooks.onError((error) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

export { app };
