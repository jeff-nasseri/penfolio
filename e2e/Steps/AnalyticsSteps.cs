using System.Text.Json;
using FluentAssertions;
using PenFolio.E2E.Support;
using Reqnroll;

namespace PenFolio.E2E.Steps;

[Binding]
public sealed class AnalyticsSteps
{
    private readonly TestState _state;
    public AnalyticsSteps(TestState state) => _state = state;

    private JsonElement Report => _state.LastJson;

    [When("I open the analytics report")]
    public async Task WhenIOpenTheReport() => await _state.GetAsync("/api/analytics");

    [Then("the total tracked applications is {int}")]
    public void ThenTotalTracked(int total)
    {
        Report.GetProperty("totals").GetProperty("applications").GetInt32().Should().Be(total);
    }

    [Then("the active pipeline is {int}")]
    public void ThenActivePipeline(int n)
    {
        Report.GetProperty("totals").GetProperty("activePipeline").GetInt32().Should().Be(n);
    }

    [Then("the report shows {int} résumé and {int} cover letter")]
    public void ThenReportShowsDocuments(int resumes, int coverLetters)
    {
        var totals = Report.GetProperty("totals");
        totals.GetProperty("resumes").GetInt32().Should().Be(resumes);
        totals.GetProperty("coverLetters").GetInt32().Should().Be(coverLetters);
    }

    [Then("the funnel shows {int} application reached the interview stage")]
    public void ThenFunnelInterview(int n)
    {
        var interview = Report.GetProperty("funnel").EnumerateArray()
            .First(f => f.GetProperty("stage").GetString() == "interview");
        interview.GetProperty("value").GetInt32().Should().Be(n);
    }
}
