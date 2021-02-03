const commitIntoHtml = require("../core/commit-into-html");
const commits = require("../mock/commits.json");

commitIntoHtml(commits, "agent-dashboard", "https://crm.joinsage.com");
