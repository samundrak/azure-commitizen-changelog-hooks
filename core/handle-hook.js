module.exports = function ({
  eventType,
  repoUrl,
  sourceRef,
  targetRef,
  mergeStatus,
}) {
  const gitApi = global.azure;

  console.log({
    eventType,
    repoUrl,
    sourceRef,
    targetRef,
    mergeStatus,
  });
};
