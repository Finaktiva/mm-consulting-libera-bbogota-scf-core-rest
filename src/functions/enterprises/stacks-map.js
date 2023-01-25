const ServerlessPluginSplitStacks = require('serverless-plugin-split-stacks');

ServerlessPluginSplitStacks.resolveMigration = function (resource, logicalId) {
    console.log("RESOURCE",resource);
    if (logicalId.startsWith("create")) return { destination: 'creation' };
    if (logicalId.startsWith("list")) return { destination: 'read' };
    if (logicalId.startsWith("update")) return { destination: 'updates' };
    if (logicalId.startsWith("delete")) return { destination: 'deletions' };

    return this.stacksMap[resource.Type];
};