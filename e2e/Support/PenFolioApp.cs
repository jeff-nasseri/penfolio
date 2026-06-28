using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using DotNet.Testcontainers.Images;

namespace PenFolio.E2E.Support;

/// <summary>
/// Spins up the real PenFolio application in a Docker container for the whole
/// test run (built from the repository Dockerfile, served on a random host
/// port with a fresh in-container database). Every scenario runs against this
/// live instance, so the tests exercise the actual shipped artifact.
/// </summary>
public static class PenFolioApp
{
    private static IFutureDockerImage? _image;
    private static IContainer? _container;

    public static string BaseUrl { get; private set; } = string.Empty;

    public static async Task StartAsync()
    {
        _image = new ImageFromDockerfileBuilder()
            .WithDockerfileDirectory(CommonDirectoryPath.GetGitDirectory(), string.Empty)
            .WithDockerfile("Dockerfile")
            .WithName("penfolio-e2e:latest")
            .WithDeleteIfExists(true)
            .WithCleanUp(false)
            .Build();

        await _image.CreateAsync();

        _container = new ContainerBuilder()
            .WithImage(_image)
            .WithEnvironment("APP_VERSION", "0.7.0.0-e2e")
            .WithEnvironment("JWT_SECRET", "e2e-test-secret")
            .WithEnvironment("DEFAULT_USERNAME", "admin")
            .WithEnvironment("DEFAULT_PASSWORD", "admin123")
            .WithPortBinding(3000, true)
            .WithWaitStrategy(
                Wait.ForUnixContainer().UntilHttpRequestIsSucceeded(req => req.ForPort(3000).ForPath("/api/health")))
            .Build();

        await _container.StartAsync();

        BaseUrl = $"http://{_container.Hostname}:{_container.GetMappedPublicPort(3000)}";
    }

    public static async Task StopAsync()
    {
        if (_container is not null)
        {
            await _container.DisposeAsync();
        }

        if (_image is not null)
        {
            await _image.DisposeAsync();
        }
    }
}
