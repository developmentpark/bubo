import OctokitService from "./octokitService.js";
import { messages } from "./messages.js";

async function isApprovedToAutoReview(octokitService) {
  const reviewers = await octokitService.getReviewers();
  return reviewers.length === 0;
}

async function performAutoReview({ octokit, payload }) {
  const octokitService = new OctokitService({ octokit, payload });
  try {
    const resolveReviewMessage = getRndMessage(messages.RESOLVE_AUTO_REVIEW);
    await octokitService.postReview(resolveReviewMessage);

    await octokitService.postMerge();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

async function notifyPullRequestReception({ octokit, payload }) {
  const octokitService = new OctokitService({ octokit, payload });
  const newPRMessage = getRndMessage(messages.NEW_PR);
  await octokitService.postComment(newPRMessage);
}

function getRndMessage(messages) {
  const idx = Math.floor(Math.random() * messages.length);
  return messages[idx];
}

async function performAutoReviewByLabeled({ octokit, payload }) {
  const octokitService = new OctokitService({ octokit, payload });
  const selfReviewLabel = "bubo";
  try {
    if (!octokitService.isLabel(selfReviewLabel)) {
      return;
    }
    const resolveReviewMessage = getRndMessage(messages.RESOLVE_AUTO_REVIEW);
    await octokitService.postReview(resolveReviewMessage);
    await octokitService.postMerge();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

export {
  performAutoReview,
  performAutoReviewByLabeled,
  notifyPullRequestReception,
};
