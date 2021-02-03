module.exports = async function (
  repoId,
  { fromCommitId, toCommitId, version, ...rest }
) {
  const gitApi = await global.azure.getGitApi();
  const commits = await gitApi.getCommits(
    repoId,
    {
      itemVersion: {
        version,
        versionType: "branch",
      },
      fromCommitId,
      toCommitId,
      ...rest,
    },
    "Dev"
  );
  return (commits || []).map((commit) => ({
    id: commit.commitId,
    author: commit.author,
    comment: commit.comment,
    url: commit.url,
  }));
};
