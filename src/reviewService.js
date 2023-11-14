import OctokitService from "./octokitService.js";
import { messages } from "./messages.js";

export default class ReviewService {
  constructor({ octokit, payload }) {
    this.octokitService = new OctokitService({ octokit, payload });
  }

  async hasReviewers() {
    const reviewers = await this.octokitService.getReviewers();
    return reviewers.length > 0;
  }

  async hasBotLikeReviewer() {
    const botName = "bubo";
    return await this.octokitService.isLabel(botName);
  }

  async hasChecksSuite() {
    const checksSuiteInfo = await this.octokitService.getChecksSuiteInfo();
    return checksSuiteInfo["total_count"] > 0;
  }

  async isChecksSuiteCompletedSuccess() {
    const checksSuiteInfo = await this.octokitService.getChecksSuiteInfo();
    return !checksSuiteInfo["check_suites"].some(
      ({ status, conclusion }) =>
        status != "completed" || conclusion != "success",
    );
  }

  async isMergeable() {
    const { merged, mergeable, state } =
      await this.octokitService.getMergeInfo();
    return !merged && mergeable && state == "clean";
  }

  async isApprovedToAutoReview() {
    const reviewers = await this.octokitService.getReviewers();
    return reviewers.length === 0;
  }

  async performAutoReview() {
    try {
      const resolveReviewMessage = this.getRndMessage(
        messages.RESOLVE_AUTO_REVIEW,
      );
      await this.octokitService.postReview(resolveReviewMessage);

      await this.octokitService.postMerge();
    } catch (error) {
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }

  async notifyPullRequestReception() {
    const newPRMessage = this.getRndMessage(messages.NEW_PR);
    await this.octokitService.postComment(newPRMessage);
  }

  getRndMessage(messages) {
    const idx = Math.floor(Math.random() * messages.length);
    return messages[idx];
  }
}
