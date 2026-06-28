using System.Text.Json;
using FluentAssertions;
using PenFolio.E2E.Support;
using Reqnroll;

namespace PenFolio.E2E.Steps;

[Binding]
public sealed class TrackerSteps
{
    private readonly TestState _state;
    private readonly Workspace _workspace;

    public TrackerSteps(TestState state, Workspace workspace)
    {
        _state = state;
        _workspace = workspace;
    }

    [When("I open the job board")]
    public async Task WhenIOpenTheBoard() => await _workspace.BoardAsync();

    [Then("the board has the columns {string}")]
    public async Task ThenBoardHasColumns(string commaSeparated)
    {
        var expected = commaSeparated.Split(',').Select(s => s.Trim());
        var names = (await _workspace.BoardAsync())
            .GetProperty("columns").EnumerateArray()
            .Select(c => c.GetProperty("name").GetString());
        names.Should().Contain(expected);
    }

    [Given("a column named {string}")]
    [When("I create a column named {string}")]
    public async Task CreateColumn(string name)
    {
        await _state.PostAsync("/api/tracker/columns", new { name, color = "#8B7BFF", stage = "applied" });
    }

    [Then("the board has a column named {string}")]
    public async Task ThenBoardHasColumn(string name)
    {
        (await ColumnNames()).Should().Contain(name);
    }

    [Then("the board has no column named {string}")]
    public async Task ThenBoardHasNoColumn(string name)
    {
        (await ColumnNames()).Should().NotContain(name);
    }

    [When("I rename the column {string} to {string}")]
    public async Task WhenIRenameColumn(string oldName, string newName)
    {
        var id = await _workspace.ColumnIdAsync(oldName);
        await _state.PutAsync($"/api/tracker/columns/{id}", new { name = newName });
    }

    [When("I delete the column {string}")]
    public async Task WhenIDeleteColumn(string name)
    {
        var id = await _workspace.ColumnIdAsync(name);
        await _state.DeleteAsync($"/api/tracker/columns/{id}");
    }

    [When("I add the application {string} for the role {string} to the {string} column")]
    public async Task WhenIAddApplication(string company, string role, string column)
    {
        await _workspace.AddApplicationAsync(company, role, column);
    }

    [Given("the application {string} in the {string} column")]
    public async Task GivenApplicationInColumn(string company, string column)
    {
        await _workspace.AddApplicationAsync(company, "", column);
    }

    [Given("I have added {int} applications to the {string} column")]
    [Given("I have added {int} application to the {string} column")]
    public async Task GivenAddedNApplications(int count, string column)
    {
        for (var i = 0; i < count; i++)
        {
            await _workspace.AddApplicationAsync($"Company {column} {i + 1}", "Role", column);
        }
    }

    [Then("the {string} column contains {string}")]
    public async Task ThenColumnContains(string column, string company)
    {
        (await CompaniesInColumn(column)).Should().Contain(company);
    }

    [Then("the {string} column does not contain {string}")]
    public async Task ThenColumnDoesNotContain(string column, string company)
    {
        (await CompaniesInColumn(column)).Should().NotContain(company);
    }

    [When("I move {string} to the {string} column")]
    public async Task WhenIMoveApplication(string company, string toColumn)
    {
        var board = await _workspace.BoardAsync();
        var appId = board.GetProperty("applications").EnumerateArray()
            .First(a => a.GetProperty("company").GetString() == company)
            .GetProperty("id").GetInt32();
        var columnId = await _workspace.ColumnIdAsync(toColumn);
        await _state.PutAsync($"/api/tracker/applications/{appId}/move", new { columnId, sortOrder = 0 });
    }

    [Then("the board has no application {string}")]
    public async Task ThenBoardHasNoApplication(string company)
    {
        var apps = (await _workspace.BoardAsync()).GetProperty("applications").EnumerateArray()
            .Select(a => a.GetProperty("company").GetString());
        apps.Should().NotContain(company);
    }

    private async Task<IEnumerable<string?>> ColumnNames() =>
        (await _workspace.BoardAsync()).GetProperty("columns").EnumerateArray()
            .Select(c => c.GetProperty("name").GetString())
            .ToList();

    private async Task<IEnumerable<string?>> CompaniesInColumn(string column)
    {
        var board = await _workspace.BoardAsync();
        var columnId = board.GetProperty("columns").EnumerateArray()
            .First(c => c.GetProperty("name").GetString() == column)
            .GetProperty("id").GetInt32();
        return board.GetProperty("applications").EnumerateArray()
            .Where(a => a.GetProperty("columnId").GetInt32() == columnId)
            .Select(a => a.GetProperty("company").GetString())
            .ToList();
    }
}
