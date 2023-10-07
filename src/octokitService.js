export default class OctokitService {
  constructor({ octokit, payload }) {
    this.octokit = octokit;
    this.payload = payload;
    this.owner = this.payload.repository.owner.login;
    this.repo = this.payload.repository.name;
    this.issue_number = this.payload.pull_request.number;
  }

  async getReviewers() {
    const res = await this.octokit.rest.pulls.listRequestedReviewers({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
    });
    return res.data.users;
  }

  postComment(comment) {
    return this.octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: this.owner,
        repo: this.repo,
        issue_number: this.issue_number,
        body: comment,
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      },
    );
  }

  postReview(comment) {
    return this.octokit.rest.pulls.createReview({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
      body: comment,
      event: "APPROVE",
    });
  }

  postMerge() {
    return this.octokit.rest.pulls.merge({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
    });
  }
}
