var express = require("express");
const getCommit = require("../core/commits-repo");
const handleHook = require("../core/handle-hook");
const { route } = require("./users");
var router = express.Router();
const commits = require("../mock/commits.json");
const commitIntoFile = require("../core/commit-into-html");
const groupedCommits = require("../mock/grouped-commits");
const commitIntoHtml = require("../core/commit-into-html");
const sendMail = require("../core/send-mail");

const allowedProjects = ["sage-tech-blog", "agent-dashboard", "Fabrikam"];
const allowedBranches = ["develop", "master"];

async function handleMergeHook(req, res, next) {
  try {
    const { resource, ...data } = req.body;
    if (resource.status !== "completed") return res.send(200);
    const startCommit = resource.lastMergeCommit.commitId;
    const uptoCommit = resource.lastMergeTargetCommit.commitId;
    const sourceBranch = resource.sourceRefName.split("/").pop();

    const targetBranch = resource.targetRefName.split("/").pop();
    if (!allowedBranches.includes(targetBranch)) {
      return res.send(200);
    }
    if (!allowedProjects.includes(resource.repository.name))
      return res.send(200);

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
      "https://crm.joinsage.com",
      {
        targetBranch,
      }
    );
    await sendMail(
      html,
      `[${resource.repository.name} UPDATE]: ${resource.createdBy.displayName} merged "${sourceBranch}" into "${targetBranch}"`,
      "samundra.kc6@gmail.com"
    );
    console.log("Mail sent");
    res.send(200);
  } catch (err) {
    console.log(err);
    res.send(500);
  }
}
router.post("/api/hook", handleMergeHook);
router.get("/template/develop", (req, res) => {
  return res.render("develop", {
    repo: "agent-dashboard",
    previewHostname: "https://crm.joinsage.com",
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
module.exports = router;
