var express = require("express");
const startCase = require("lodash.startcase");
const getCommit = require("../core/commits-repo");
var router = express.Router();
const groupedCommits = require("../mock/grouped-commits");
const commitIntoHtml = require("../core/commit-into-html");
const sendMail = require("../core/send-mail");
// const { null } = require("../mock/grouped-commits");

const allowedProjects = process.env.ALLOWED_PROJECTS.split(",");
const allowedBranches = process.env.ALLOWED_BRANCHES.split(",");

async function handleMergeHook(req, res, next) {
  try {
    const { resource, ...data } = req.body;
    if (resource.status !== "completed") return res.send(200);
    const startCommit = resource.lastMergeCommit.commitId;
    const uptoCommit = resource.lastMergeTargetCommit.commitId;
    const sourceBranch = resource.sourceRefName.split("/").pop();

    const targetBranch = resource.targetRefName.split("/").pop();
    if (!allowedBranches.includes(targetBranch)) {
      return res.sendStatus(200);
    }
    if (!allowedProjects.includes(resource.repository.name))
      return res.sendStatus(200);
    console.log({ data, resource });
    const topCommit = targetBranch === "develop" ? 20 : 50;
    const commits = await getCommit(resource.repository.name, {
      $top: topCommit,
      version: targetBranch,
    });
    const commitTrail = [startCommit, uptoCommit];
    const concernedCommits = [];
    commits.forEach((commit) => {
      if (!commitTrail.length) return;
      if (commit.id === startCommit || commit.id == uptoCommit) {
        commitTrail.pop();
      }
      concernedCommits.push(commit);
    });
    if (!concernedCommits.length) return;
    const html = await commitIntoHtml(
      concernedCommits,
      resource.repository.name,
      `http://${resource.repository.name}-${sourceBranch}.saze.io`,
      {
        targetBranch,
        sourceBranch,
        repositoryUrl: resource.repository.remoteUrl,
        pullRequestUrl: `${process.env.PULL_REQUEST_URL}${resource.repository.name}/pullrequest/${resource.pullRequestId}`,
      }
    );
    sendMail(
      html,
      `${resource.createdBy.displayName} just merged ${sourceBranch} into ${targetBranch}.`,
      process.env.MAIL_RECIPIENTS,
      `${startCase(resource.repository.name)} | ${
        resource.createdBy.displayName
      }`
    );
    console.log("Mail sent");
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}
router.post("/api/hook", handleMergeHook);
router.get("/template/develop", (req, res) => {
  const sourceBranch = "15900-validation-message";
  let splittedBranch = (sourceBranch || "").split("-");
  let ticketNo = null;
  if (!isNaN(Number(splittedBranch[0]))) {
    ticketNo = Number(splittedBranch[0]);
  }
  const repo = "agent-dashboard";
  return res.render("develop", {
    repo: "agent-dashboard",
    previewHostname: "https://crm.joinsage.com",
    workItemId: ticketNo,
    workItemLink: `${process.env.WORKITEM_URL}${ticketNo}`,
    links: {
      master: `http://${repo}-master.saze.io`,
      develop: `http://${repo}-develop.saze.io`,
      pullRequest: "",
      repository: "",
    },
    commits: {
      feat: {
        name: "Features",
        color: "green",
        items: groupedCommits.feat,
        icon: "done_all",
      },
      fix: {
        name: "Bugfixes",
        color: "purple",
        items: groupedCommits.fix,
        icon: "build",
      },
      chore: {
        name: "Chores",
        items: groupedCommits.chore,
        icon: "face",
      },
      refactor: {
        name: "Refactors",
        color: "",
        items: groupedCommits.refactor,
        icon: "clear_all",
      },
      docs: {
        name: "Documentations",
        color: "pink",
        items: groupedCommits.docs || [],
        icon: "article",
      },
    },
  });
});
router.get("/test", async (req, res) => {
  res.sendStatus(200);
});

router.post("/api/create-pull-request-comment", async (req, res) => {
  try {
    const { resource, ...data } = req.body;
    const sourceBranch = resource.sourceRefName.split("/").pop();
    const targetBranch = resource.targetRefName.split("/").pop();
    if (!allowedBranches.includes(targetBranch)) {
      return res.sendStatus(200);
    }
    if (!allowedProjects.includes(resource.repository.name))
      return res.sendStatus(200);

    const pullRequestId = resource.pullRequestId;
    const repositoryId = resource.repository.id;
    const gitApi = await global.azure.getGitApi();
    const previewHostname = `http://${resource.repository.name}-${sourceBranch}.saze.io`;

    await gitApi.createThread(
      {
        comments: [
          {
            content: `
# **Thank you for this pull request**

Here is the preview link of this PR [${previewHostname}](${previewHostname}) 

 
_Learn more about frontend guidelines here. [Frontend Wiki](https://frontend.saze.io)_

`,
          },
        ],
      },
      repositoryId,
      pullRequestId,
      "Dev"
    );
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});
module.exports = router;
