using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace PenFolio.E2E.Support;

/// <summary>
/// Per-scenario state: an HTTP client pointed at the live container, the
/// current session token, and the last response so steps can assert on it.
/// </summary>
public sealed class TestState
{
    // Cookies disabled so the API's session cookie never authenticates us — the
    // tests exercise the Bearer-token flow the SPA uses.
    public HttpClient Http { get; } =
        new(new HttpClientHandler { UseCookies = false }) { BaseAddress = new Uri(PenFolioApp.BaseUrl) };

    public string? Token { get; set; }
    public string CurrentPassword { get; set; } = "admin123";
    public HttpResponseMessage? LastResponse { get; set; }
    public JsonElement LastJson { get; set; }

    private void ApplyAuth()
    {
        Http.DefaultRequestHeaders.Authorization =
            Token is null ? null : new AuthenticationHeaderValue("Bearer", Token);
    }

    public async Task<HttpResponseMessage> SignInAsync(string username, string password)
    {
        Token = null;
        ApplyAuth();
        var res = await Http.PostAsJsonAsync("/api/auth/login", new { username, password });
        LastResponse = res;
        if (res.IsSuccessStatusCode)
        {
            var json = await res.Content.ReadFromJsonAsync<JsonElement>();
            Token = json.GetProperty("token").GetString();
            ApplyAuth();
        }
        return res;
    }

    public async Task<HttpResponseMessage> GetAsync(string path)
    {
        ApplyAuth();
        LastResponse = await Http.GetAsync(path);
        await CaptureJsonAsync();
        return LastResponse;
    }

    public async Task<HttpResponseMessage> PostAsync(string path, object? body = null)
    {
        ApplyAuth();
        LastResponse = await Http.PostAsJsonAsync(path, body ?? new { });
        await CaptureJsonAsync();
        return LastResponse;
    }

    public async Task<HttpResponseMessage> PutAsync(string path, object body)
    {
        ApplyAuth();
        LastResponse = await Http.PutAsJsonAsync(path, body);
        await CaptureJsonAsync();
        return LastResponse;
    }

    public async Task<HttpResponseMessage> DeleteAsync(string path)
    {
        ApplyAuth();
        LastResponse = await Http.DeleteAsync(path);
        return LastResponse;
    }

    private async Task CaptureJsonAsync()
    {
        if (LastResponse is null) return;
        var media = LastResponse.Content.Headers.ContentType?.MediaType;
        if (media == "application/json")
        {
            try
            {
                LastJson = await LastResponse.Content.ReadFromJsonAsync<JsonElement>();
            }
            catch
            {
                /* non-JSON or empty body */
            }
        }
    }
}
