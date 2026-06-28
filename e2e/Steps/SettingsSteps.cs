using System.Text;
using FluentAssertions;
using PenFolio.E2E.Support;
using Reqnroll;

namespace PenFolio.E2E.Steps;

[Binding]
public sealed class SettingsSteps
{
    private readonly TestState _state;
    private string _exported = string.Empty;

    public SettingsSteps(TestState state) => _state = state;

    [When("I open the About information")]
    public async Task WhenIOpenAbout() => await _state.GetAsync("/api/settings/about");

    [Then("a software version is reported")]
    public void ThenVersionReported()
    {
        var version = _state.LastJson.GetProperty("version").GetString();
        version.Should().NotBeNullOrWhiteSpace();
    }

    [When("I export my workspace")]
    public async Task WhenIExport()
    {
        var res = await _state.GetAsync("/api/settings/export");
        res.IsSuccessStatusCode.Should().BeTrue();
        _exported = await res.Content.ReadAsStringAsync();
    }

    [When("I import the previously exported workspace")]
    public async Task WhenIImport()
    {
        var content = new StringContent(_exported, Encoding.UTF8, "application/json");
        _state.LastResponse = await _state.Http.PostAsync("/api/settings/import", content);
        _state.LastResponse.IsSuccessStatusCode.Should().BeTrue();
    }

    [When("I purge all data")]
    public async Task WhenIPurge()
    {
        var res = await _state.PostAsync("/api/settings/purge");
        res.IsSuccessStatusCode.Should().BeTrue();
    }

    [When("I change my password to {string}")]
    [Then("I change my password back to {string}")]
    public async Task ChangePassword(string newPassword)
    {
        var res = await _state.PostAsync(
            "/api/auth/change-password",
            new { currentPassword = _state.CurrentPassword, newPassword });
        res.IsSuccessStatusCode.Should().BeTrue();
        _state.CurrentPassword = newPassword;
    }

    [Then("I can sign in with the new password {string}")]
    public async Task ThenICanSignInWithNewPassword(string password)
    {
        var res = await _state.SignInAsync("admin", password);
        res.IsSuccessStatusCode.Should().BeTrue();
    }
}
