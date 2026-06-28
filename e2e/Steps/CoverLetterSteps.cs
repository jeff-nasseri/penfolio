using FluentAssertions;
using PenFolio.E2E.Support;
using Reqnroll;

namespace PenFolio.E2E.Steps;

[Binding]
public sealed class CoverLetterSteps
{
    private readonly TestState _state;
    private readonly Workspace _workspace;

    public CoverLetterSteps(TestState state, Workspace workspace)
    {
        _state = state;
        _workspace = workspace;
    }

    [Given("a cover letter titled {string}")]
    [When("I create a cover letter titled {string}")]
    public async Task CreateCoverLetter(string title) => await _workspace.CreateCoverLetterAsync(title);

    [When("I duplicate the cover letter {string}")]
    public async Task WhenIDuplicate(string title)
    {
        var id = await _workspace.CoverLetterIdAsync(title);
        await _state.PostAsync($"/api/cover-letters/{id}/duplicate");
    }

    [When("I delete the cover letter {string}")]
    public async Task WhenIDelete(string title)
    {
        var id = await _workspace.CoverLetterIdAsync(title);
        await _state.DeleteAsync($"/api/cover-letters/{id}");
    }

    [Then("my cover letter library contains {string}")]
    public async Task ThenLibraryContains(string title)
    {
        (await _workspace.CoverLetterExistsAsync(title)).Should().BeTrue();
    }

    [Then("my cover letter library does not contain {string}")]
    public async Task ThenLibraryDoesNotContain(string title)
    {
        (await _workspace.CoverLetterExistsAsync(title)).Should().BeFalse();
    }
}
