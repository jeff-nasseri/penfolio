using Reqnroll;

namespace PenFolio.E2E.Support;

[Binding]
public sealed class Hooks
{
    private readonly TestState _state;

    public Hooks(TestState state) => _state = state;

    [BeforeTestRun]
    public static async Task StartApplication() => await PenFolioApp.StartAsync();

    [AfterTestRun]
    public static async Task StopApplication() => await PenFolioApp.StopAsync();

    // Give every scenario a clean, authenticated workspace so scenarios never
    // leak data into one another. The account itself is preserved.
    [BeforeScenario(Order = 0)]
    public async Task ResetWorkspace()
    {
        await _state.SignInAsync("admin", _state.CurrentPassword);
        await _state.PostAsync("/api/settings/purge");
    }
}
