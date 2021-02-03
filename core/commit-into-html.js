const fs = require("fs");
const through = require("through2");
const forEach = require("lodash").forEach;
var conventionalCommitsParser = require("conventional-commits-parser");
const jade = require("jade");
const path = require("path");

module.exports = (commits, repo, previewHostname, { targetBranch }) => {
  return new Promise((resolve, reject) => {
    const stream = through.obj();
    forEach(
      commits.map((item) => item.comment),
      function (commit) {
        stream.write(commit);
      }
    );
    stream.end();
    const commitsList = {};
    stream
      .pipe(conventionalCommitsParser({}))
      .pipe(
        through.obj((chunk, enc, cb) => {
          if (!commitsList[chunk.type]) {
            commitsList[chunk.type] = [];
          }

          commitsList[chunk.type].push(chunk);
          cb();
        })
      )
      .on("finish", () => {
        var renderFunc = jade.compileFile(
          path.join(__dirname, "../views/develop.jade")
        );
        var html = renderFunc({
          repo,
          previewHostname,
          targetBranch,
          commits: {
            feat: {
              name: "Features",
              color: "green",
              items: commitsList.feat || [],
              icon: "done_all",
            },
            fix: {
              name: "Bugfixes",
              color: "purple",
              items: commitsList.fix || [],
              icon: "build",
            },
            chore: {
              name: "Chores",
              items: commitsList.chore || [],
              icon: "face",
            },
            refactor: {
              name: "Refactors",
              color: "",
              items: commitsList.refactor || [],
              icon: "clear_all",
            },
            docs: {
              name: "Documentations",
              color: "pink",
              items: commitsList.docs || [],
              icon: "article",
            },
          },
        });
        resolve(html);
      });
  });
};
