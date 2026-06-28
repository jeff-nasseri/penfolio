using Xunit;

// All scenarios run against a single shared application container and the same
// admin account, so they must run sequentially (each scenario purges and
// re-seeds the workspace). Disable xUnit's parallel test execution.
[assembly: CollectionBehavior(DisableTestParallelization = true)]
