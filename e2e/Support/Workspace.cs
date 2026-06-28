using System.Net.Http.Json;
using System.Text.Json;

namespace PenFolio.E2E.Support;

/// <summary>Domain helpers over the REST API, shared by the step definitions.</summary>
public sealed class Workspace
{
    private readonly TestState _state;
    public Workspace(TestState state) => _state = state;

    public async Task<JsonElement> BoardAsync()
    {
        await _state.GetAsync("/api/tracker");
        return _state.LastJson;
    }

    public async Task<int> ColumnIdAsync(string name)
    {
        var board = await BoardAsync();
        foreach (var c in board.GetProperty("columns").EnumerateArray())
        {
            if (c.GetProperty("name").GetString() == name) return c.GetProperty("id").GetInt32();
        }
        throw new InvalidOperationException($"Column '{name}' not found");
    }

    public async Task AddApplicationAsync(string company, string role, string column)
    {
        var columnId = await ColumnIdAsync(column);
        await _state.PostAsync("/api/tracker/applications", new { columnId, company, role });
    }

    public async Task<JsonElement> ResumesAsync()
    {
        await _state.GetAsync("/api/resumes");
        return _state.LastJson;
    }

    public async Task<int> CreateResumeAsync(string title)
    {
        await _state.PostAsync("/api/resumes", new { title, content = new { }, customization = new { } });
        return _state.LastJson.GetProperty("id").GetInt32();
    }

    public async Task<int> ResumeIdAsync(string title)
    {
        foreach (var r in (await ResumesAsync()).EnumerateArray())
        {
            if (r.GetProperty("title").GetString() == title) return r.GetProperty("id").GetInt32();
        }
        throw new InvalidOperationException($"Résumé '{title}' not found");
    }

    public async Task<bool> ResumeExistsAsync(string title)
    {
        foreach (var r in (await ResumesAsync()).EnumerateArray())
        {
            if (r.GetProperty("title").GetString() == title) return true;
        }
        return false;
    }

    public async Task<JsonElement> CoverLettersAsync()
    {
        await _state.GetAsync("/api/cover-letters");
        return _state.LastJson;
    }

    public async Task<int> CreateCoverLetterAsync(string title)
    {
        await _state.PostAsync("/api/cover-letters", new { title, content = new { }, customization = new { } });
        return _state.LastJson.GetProperty("id").GetInt32();
    }

    public async Task<int> CoverLetterIdAsync(string title)
    {
        foreach (var c in (await CoverLettersAsync()).EnumerateArray())
        {
            if (c.GetProperty("title").GetString() == title) return c.GetProperty("id").GetInt32();
        }
        throw new InvalidOperationException($"Cover letter '{title}' not found");
    }

    public async Task<bool> CoverLetterExistsAsync(string title)
    {
        foreach (var c in (await CoverLettersAsync()).EnumerateArray())
        {
            if (c.GetProperty("title").GetString() == title) return true;
        }
        return false;
    }
}
