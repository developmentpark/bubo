import OctokitService from "./octokitService.js";
import { messages } from "./messages.js";

async function isApprovedToAutoReview(octokitService) {
  const reviewers = await octokitService.getReviewers();
  return reviewers.length === 0;
}

async function performAutoReview({ octokit, payload }) {
  const octokitService = new OctokitService({ octokit, payload });
  try {
    await octokitService.postComment(messages.NEW_PR);
    const isApproved = await isApprovedToAutoReview(octokitService);
    if (!isApproved) {
      return await octokitService.postComment(messages.REJECT_AUTO_REVIEW);
    }
    await octokitService.postReview(messages.RESOLVE_AUTO_REVIEW);
    await octokitService.postMerge();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

export { performAutoReview };
