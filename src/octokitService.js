export default class OctokitService {
  constructor({ octokit, payload }) {
    this.octokit = octokit;
    this.payload = payload;
    this.owner = this.payload.repository.owner.login;
    this.repo = this.payload.repository.name;
    this.issue_number = (
      this.payload.pull_request || this.payload["check_run"].pull_requests[0]
    ).number;
  }

  async getChecksSuiteInfo() {
    const checksSuiteInfo = await this.octokit.rest.checks.listSuitesForRef({
      owner: this.owner,
      repo: this.repo,
      ref: `pull/${this.issue_number}/head`,
    });

    return checksSuiteInfo.data;
  }

  async getMergeInfo() {
    const mergeInfo = await this.octokit.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
    });

    const data = mergeInfo.data;

    return {
      merge: data["merged"],
      mergeable: data["mergeable"],
      state: data["mergeable_state"],
    };
  }

  async getReviewers() {
    const res = await this.octokit.rest.pulls.listRequestedReviewers({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
    });
    return res.data.users;
  }

  postMessage(message) {
    return this.octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: this.owner,
        repo: this.repo,
        issue_number: this.issue_number,
        body: message,
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      },
    );
  }

  postReview(message) {
    return this.octokit.rest.pulls.createReview({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
      body: message,
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

  async isLabel(labelName) {
    const pullInfo = await this.octokit.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.issue_number,
    });

    return pullInfo.data.labels.find(
      (label) => label.name.toLowerCase() === labelName.toLowerCase(),
    );
  }
}
