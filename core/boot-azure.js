const azdev = require("azure-devops-node-api");

module.exports = function () {
  let authHandler = azdev.getPersonalAccessTokenHandler(
    process.env.PERSONAL_ACCESS_TOKEN
  );
  const connection = new azdev.WebApi(process.env.ORG_URL, authHandler);
  return connection;
};
