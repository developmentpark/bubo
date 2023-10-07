import OctokitService from "./octokitService.js";

const messageForNewPRs =
  "Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.";
const messageForResolveAutoReview =
  "Great job! The review has been approved and successfully merged. Let's keep building together!";
const messageForRejectAutoReview =
  "Automatic review was not performed as a reviewer has already been manually assigned to the pull request. Manual review is underway.";

async function isApprovedToAutoReview(octokitService) {
  const reviewers = await octokitService.getReviewers();
  return reviewers.length === 0;
}

async function performAutoReview({ octokit, payload }) {
  const octokitService = new OctokitService({ octokit, payload });
  try {
    await octokitService.postComment(messageForNewPRs);
    const isApproved = await isApprovedToAutoReview(octokitService);
    if (!isApproved) {
      return await octokitService.postComment(messageForRejectAutoReview);
    }
    await octokitService.postReview(messageForResolveAutoReview);
    await octokitService.postMerge();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

export { performAutoReview };
