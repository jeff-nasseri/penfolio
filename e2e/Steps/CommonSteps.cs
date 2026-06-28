using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using PenFolio.E2E.Support;
using Reqnroll;

namespace PenFolio.E2E.Steps;

[Binding]
public sealed class CommonSteps
{
    private readonly TestState _state;
    public CommonSteps(TestState state) => _state = state;

    [Given("I am signed in")]
    public async Task GivenIAmSignedIn()
    {
        var res = await _state.SignInAsync("admin", _state.CurrentPassword);
        res.IsSuccessStatusCode.Should().BeTrue("the default account should let me sign in");
    }

    [When("I sign in with username {string} and password {string}")]
    public async Task WhenISignIn(string username, string password)
    {
        await _state.SignInAsync(username, password);
    }

    [Then("I am granted an access token")]
    public void ThenIAmGrantedAToken()
    {
        _state.LastResponse!.StatusCode.Should().Be(HttpStatusCode.OK);
        _state.Token.Should().NotBeNullOrEmpty();
    }

    [Then("my profile shows the username {string}")]
    public async Task ThenMyProfileShowsUsername(string username)
    {
        await _state.GetAsync("/api/auth/me");
        _state.LastJson.GetProperty("username").GetString().Should().Be(username);
    }

    [Then("sign in is refused")]
    public void ThenSignInRefused()
    {
        _state.LastResponse!.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        _state.Token.Should().BeNull();
    }

    [When("I request the job board without a token")]
    public async Task WhenIRequestBoardWithoutToken()
    {
        _state.Token = null;
        _state.Http.DefaultRequestHeaders.Authorization = null;
        _state.LastResponse = await _state.Http.GetAsync("/api/tracker");
    }

    [Then("access is denied")]
    public void ThenAccessDenied()
    {
        _state.LastResponse!.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Then("I can still sign in with username {string} and password {string}")]
    [Then("I can sign in with username {string} and password {string}")]
    public async Task ThenICanSignIn(string username, string password)
    {
        var res = await _state.SignInAsync(username, password);
        res.IsSuccessStatusCode.Should().BeTrue();
    }
}
