const https = require("https");

// Function to fetch GitHub user activity
async function fetchGitHubActivity(username) {
  const chalk = (await import("chalk")).default;
  const url = `https://api.github.com/users/${username}/events`;

  const options = {
    headers: {
      "User-Agent": "Node.js",
    },
  };

  https
    .get(url, options, (res) => {
      let data = "";

      // Collect data chunks
      res.on("data", (chunk) => {
        data += chunk;
      });

      // On end of response
      res.on("end", () => {
        if (res.statusCode === 404) {
          console.error(
            chalk.red(`Error: GitHub user '${username}' not found.`)
          );
          return;
        } else if (res.statusCode !== 200) {
          console.error(
            chalk.red(
              `Error fetching activity: ${res.statusCode} - ${res.statusMessage}`
            )
          );
          return;
        }

        const events = JSON.parse(data);
        displayActivity(events, chalk);
      });
    })
    .on("error", (e) => {
      console.error(chalk.red(`Request error: ${e.message}`));
    });
}

// Function to display the fetched activity
function displayActivity(events, chalk) {
  if (events.length === 0) {
    console.log(chalk.yellow("No activity found."));
    return;
  }

  console.log(chalk.bold.blue("\nRecent Activity:"));
  console.log(chalk.yellow("─────────────────────────────────────"));

  events.forEach((event) => {
    const eventType = event.type;
    const repo = event.repo.name;

    let output = "";

    switch (eventType) {
      case "CommitCommentEvent":
        output = `Commented on a commit in ${chalk.green(repo)}`;
        break;
      case "CreateEvent":
        output = `Created a new ${event.payload.ref_type} in ${chalk.green(
          repo
        )}`;
        break;
      case "DeleteEvent":
        output = `Deleted ${event.payload.ref_type} ${
          event.payload.ref
        } from ${chalk.green(repo)}`;
        break;
      case "ForkEvent":
        output = `Forked ${chalk.green(repo)}`;
        break;
      case "GollumEvent":
        output = `Edited a wiki page in ${chalk.green(repo)}`;
        break;
      case "IssueCommentEvent":
        output = `Commented on an issue in ${chalk.green(repo)}`;
        break;
      case "IssuesEvent":
        output =
          event.payload.action === "opened"
            ? `Opened a new issue in ${chalk.green(repo)}`
            : `Closed an issue in ${chalk.green(repo)}`;
        break;
      case "MemberEvent":
        output = `Added a member to ${chalk.green(repo)}`;
        break;
      case "PublicEvent":
        output = `Made the repository ${chalk.green(repo)} public`;
        break;
      case "PullRequestEvent":
        output = `Opened a pull request in ${chalk.green(repo)}`;
        break;
      case "PullRequestReviewEvent":
        output = `Reviewed a pull request in ${chalk.green(repo)}`;
        break;
      case "PullRequestReviewCommentEvent":
        output = `Commented on a pull request in ${chalk.green(repo)}`;
        break;
      case "PullRequestReviewThreadEvent":
        output = `Created a review thread in a pull request in ${chalk.green(
          repo
        )}`;
        break;
      case "PushEvent":
        const commits = event.payload.size;
        output = `Pushed ${commits} commit(s) to ${chalk.green(repo)}`;
        break;
      case "ReleaseEvent":
        output = `Released a new version in ${chalk.green(repo)}`;
        break;
      case "SponsorshipEvent":
        output = `Received sponsorship in ${chalk.green(repo)}`;
        break;
      case "WatchEvent":
        output = `Starred ${chalk.green(repo)}`;
        break;
      default:
        output = `Event type ${eventType} occurred in ${chalk.green(repo)}`;
    }

    console.log(chalk.white("• ") + output);
  });

  console.log(chalk.yellow("─────────────────────────────────────\n"));
}

// Main function to run the CLI
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(chalk.red("Please provide a GitHub username."));
    return;
  }

  const username = args[0];
  fetchGitHubActivity(username);
}

main();
