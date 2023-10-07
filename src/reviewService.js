import OctokitService from "./octokitService.js";
import { messages } from "./messages.js";

async function isApprovedToAutoReview(octokitService) {
  const reviewers = await octokitService.getReviewers();
  return reviewers.length === 0;
}

async function performAutoReview({ octokit, payload }) {
  const octokitService = new OctokitService({ octokit, payload });
  try {
    const newPRMessage = getRndMessage(messages.NEW_PR);
    await octokitService.postComment(newPRMessage);
    const isApproved = await isApprovedToAutoReview(octokitService);
    if (!isApproved) {
      return await octokitService.postComment(messages.REJECT_AUTO_REVIEW);
    }
    const resolveReviewMessage = getRndMessage(messages.RESOLVE_AUTO_REVIEW);
    await octokitService.postReview(resolveReviewMessage);
    await octokitService.postMerge();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

function getRndMessage(messages) {
  const idx = Math.floor(Math.random() * messages.length);
  return messages[idx];
}

export { performAutoReview };
