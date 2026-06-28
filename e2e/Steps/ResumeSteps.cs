using FluentAssertions;
using PenFolio.E2E.Support;
using Reqnroll;

namespace PenFolio.E2E.Steps;

[Binding]
public sealed class ResumeSteps
{
    private readonly TestState _state;
    private readonly Workspace _workspace;

    public ResumeSteps(TestState state, Workspace workspace)
    {
        _state = state;
        _workspace = workspace;
    }

    [Given("a résumé titled {string}")]
    [When("I create a résumé titled {string}")]
    public async Task CreateResume(string title) => await _workspace.CreateResumeAsync(title);

    [When("I duplicate the résumé {string}")]
    public async Task WhenIDuplicateResume(string title)
    {
        var id = await _workspace.ResumeIdAsync(title);
        await _state.PostAsync($"/api/resumes/{id}/duplicate");
    }

    [When("I rename the résumé {string} to {string}")]
    public async Task WhenIRenameResume(string oldTitle, string newTitle)
    {
        var id = await _workspace.ResumeIdAsync(oldTitle);
        await _state.PutAsync($"/api/resumes/{id}", new { title = newTitle, content = new { }, customization = new { } });
    }

    [When("I delete the résumé {string}")]
    public async Task WhenIDeleteResume(string title)
    {
        var id = await _workspace.ResumeIdAsync(title);
        await _state.DeleteAsync($"/api/resumes/{id}");
    }

    [Then("my résumé library contains {string}")]
    public async Task ThenLibraryContains(string title)
    {
        (await _workspace.ResumeExistsAsync(title)).Should().BeTrue($"the library should contain '{title}'");
    }

    [Then("my résumé library does not contain {string}")]
    public async Task ThenLibraryDoesNotContain(string title)
    {
        (await _workspace.ResumeExistsAsync(title)).Should().BeFalse($"the library should not contain '{title}'");
    }

    [Then("my résumé library is empty")]
    public async Task ThenLibraryIsEmpty()
    {
        (await _workspace.ResumesAsync()).GetArrayLength().Should().Be(0);
    }
}
