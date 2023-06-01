export const environment = {
    //injected by Docker environment variable
    registryHost: '${REGISTRY_HOST}',
    tokenSecret: '${TOKEN_SECRET}',
    checkPullAccess: '${CHECK_PULL_ACCESS}'
};
