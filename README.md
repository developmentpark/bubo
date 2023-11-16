<h1 style="font-size:60px;" align="center">🦉</h1>
<h1 align="center">✨ Bubo Reviewer ✨</h1>
Bubo Reviewer is your virtual development companion that streamlines your workflow as you explore and become familiar with development processes. Designed for those moments when you venture into development without reviewers but still want to follow a workflow based on protected branches and pull requests.

## 🌟 Key Features

- **Automated Reviews**: Bubo Reviewer automates the review process for your pull requests.

- **Workflow Integration**: Seamlessly integrates with your existing development workflow, making it easy to maintain a consistent process even when real reviewers are not available.

- **Git Actions Synergy**: Aligns harmoniously with Git Actions, leveraging these automated processes to maintain code quality and adherence to project standards.

- **Customizable Rules**: Customize Bubo's evaluation criteria by defining specific rules through GitHub Actions jobs, adapting the automated review to your project's unique requirements.

- **Merge Automation**: Bubo can also automatically merge your pull requests when they meet your defined criteria.

## 🛠️ How Works

- **Conflict-Free Integration**: Ensures a conflict-free integration by meticulously checking for conflicts within the branch.

- **Git Actions Validation**: Rigorously validates the success of Git Actions, encompassing various automated checks such as running tests, applying linters, enforcing coding conventions, and any other tasks defined in the GitHub Actions workflow..

- **Automated Review and Merge**: In the absence of assigned human reviewers, Bubo seamlessly takes charge of the review process, following your defined custom rules through GitHub Actions jobs. Additionally, you have the flexibility to prioritize Bubo over other assigned reviewers, facilitating automatic review and merge.

## 💻 Tech

Bubo Reviewer is powered by a set of modern technologies:

- **JavaScript**: The core logic of Bubo Reviewer is built on JavaScript.

- **Node.js**: Bubo Reviewer runs in the Node.js environment. Node.js is fundamental for listening and responding to real-time GitHub webhook events.

- **GitHub App**: Bubo Reviewer is a custom GitHub App, which means it integrates directly with your repository and processes pull request and code change-related events.

- **Octokit**: To interact programmatically with the GitHub API, Bubo Reviewer uses the Octokit library. Octokit simplifies communication with GitHub.
  [@octokit/rest](https://octokit.github.io/rest.js/): For working with GitHub's REST API.
  [@octokit/webhooks](https://github.com/octokit/webhooks.js): For handling GitHub webhooks.

## 🚀 Usage

### Using the GitHub App

1. Install the **Bubo Reviewer** GitHub App in your repository by visiting [this link](https://github.com/apps/bubo-reviewer).
2. Follow the setup instructions provided by the app to configure it for your repository.

### Running Your Own Server

If you want to run your own instance of Bubo Reviewer, follow these steps:

1. Register your own GitHub App by following the [official GitHub documentation](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app).
2. Clone this repository to your local machine.
3. Configure the app using your own GitHub App credentials.
4. Run the server using Node.js.

## 🤝 Contribution

¡We appreciate your interest in contributing to Bubo Reviewer! If you'd like to help improve this GitHub App, please follow these steps:

1. Fork the repository.
2. Create your feature branch: `git checkout -b my-new-feature`.
3. Make your changes and commit them: `git commit -m 'Add a cool feature'`.
4. Push your changes: `git push origin my-new-feature`.
5. Open a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Happy coding with Bubo Reviewer! 🦉
