using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using daq_api.Contracts;
using daq_api.Formatters;
using daq_api.Models;
using daq_api.Models.WebMap;
using Serilog;

namespace daq_api.Services
{
    public class ArcOnlineHttpClient
    {
        private const string AgolUrl = "https://www.arcgis.com/sharing/rest/";
        private const string TokenUrl = "oauth2/token/";
        private const string AgolItemUrl = "content/items/";
        private const int OneHourBufferInSeconds = 3600;
        private readonly HttpClient _client;
        private readonly IArcOnlineCredentials _credentials;
        private DateTime _expiresIn = DateTime.UtcNow;
        private string _currentToken;

        public ArcOnlineHttpClient(IArcOnlineCredentials credentials)
        {
            var httpClientHandler = new HttpClientHandler();
            if (httpClientHandler.SupportsAutomaticDecompression)
            {
                httpClientHandler.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
            }

            _client = new HttpClient(httpClientHandler);

            _credentials = credentials;
            Formatters = new List<MediaTypeFormatter>
            {
                new PlainTextFormatter()
            };
        }

        private IEnumerable<MediaTypeFormatter> Formatters { get; set; }

        public async Task<ArcOnlineResponse<UploadResponse>> UploadDocument(string url, MultipartFormDataContent formContent)
        {
            Log.Information("{Action} attachments for {Url}, {@Payload}", "Uploading", url, formContent);

            try
            {
                using (var response = await _client.PostAsync(url, formContent).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<UploadResponse>(Formatters).ConfigureAwait(false);
                        Log.Debug("{Action} response {@Response}", "upload", result);

                        return new ArcOnlineResponse<UploadResponse>(response, result);
                    }
                    catch (Exception ex)
                    {
                        var content = response.Content.ReadAsStringAsync().Result;
                        Log.Error(ex, "Reading {Action} response {Url} {@Response}", "upload attachment", url, content);

                        return new ArcOnlineResponse<UploadResponse>(response, new UploadResponse
                        {
                            Error = new Error
                            {
                                Details = new List<string>
                                {
                                    ex.Message,
                                    content
                                }
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "{Action} attachments for {Url}, {@Payload}", "Uploading", url, formContent);

                return new ArcOnlineResponse<UploadResponse>(null, new UploadResponse
                {
                    Error = new Error
                    {
                        Message = ex.Message
                    }
                });
            }
        }

        public async Task<ArcOnlineResponse<DeleteResponse>> DeleteDocument(string url, MultipartFormDataContent formContent)
        {
            Log.Information("{Action} attachments for {Url} {@Payload}", "deleting", url, formContent);

            try
            {
                using (var response = await _client.PostAsync(url, formContent).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<DeleteResponse>(Formatters).ConfigureAwait(false);
                        result.DeleteAttachmentResult = result.DeleteAttachmentResults.Single();
                        result.DeleteAttachmentResults = null;

                        Log.Debug("{Action} response {@Response}", "delete", result);


                        return new ArcOnlineResponse<DeleteResponse>(response, result);
                    }
                    catch (Exception ex)
                    {
                        var content = response.Content.ReadAsStringAsync().Result;
                        Log.Error(ex, "Reading {Action} response {Url} {@Response}", "delete attachment", url, content);

                        return new ArcOnlineResponse<DeleteResponse>(response, new DeleteResponse
                        {
                            Error = new Error
                            {
                                Details = new List<string>
                                {
                                    ex.Message,
                                    content
                                }
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "{Action} attachments for {Url}, {@Payload}", "Deleting", url, formContent);

                return new ArcOnlineResponse<DeleteResponse>(null, new DeleteResponse
                {
                    Error = new Error
                    {
                        Message = ex.Message
                    }
                });
            }
        }

        public async Task<ArcOnlineResponse<AttachmentResponse>> GetAttachmentsFor(string url)
        {
            Log.Information("{Action} attachments for {Url}", "Fetching", url);
            
            try
            {
                using (var response = await _client.GetAsync(url).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<AttachmentResponse>(Formatters).ConfigureAwait(false);
                        Log.Debug("{Action} response {@Response}", "Get Attachment", result);

                        return new ArcOnlineResponse<AttachmentResponse>(response, result);
                    }
                    catch (Exception ex)
                    {
                        var content = response.Content.ReadAsStringAsync().Result;
                        Log.Error(ex, "Reading {Action} response {Url} {@Response}", "attachment list", url, content);
                        
                        return new ArcOnlineResponse<AttachmentResponse>(response, new AttachmentResponse
                        {
                            Error = new Error
                            {
                                Details = new List<string>
                                {
                                    ex.Message,
                                    content
                                }
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "{Action} attachments for {Url}", "Fetching", url);

                return new ArcOnlineResponse<AttachmentResponse>(null, new AttachmentResponse
                {
                    Error = new Error
                    {
                        Message = ex.Message
                    }
                });
            }
        }

        public async Task<WebMapJson> GetWebMapJsonFor(string webmap, string token)
        {
            if (string.IsNullOrEmpty(webmap))
            {
                Log.Error("Web Map Id cannot be empty when looking for a bookmark");

                throw new ArgumentNullException(webmap, "Web Map Id cannot be empty when looking for a bookmark");
            }

            var queryParams = new[]
                {
                    new KeyValuePair<string, string>("f", "json"),
                    new KeyValuePair<string, string>("token", token)
                };

            var formUrl = new FormUrlEncodedContent(queryParams);
            var querystringContent = await formUrl.ReadAsStringAsync();

            var url = AgolUrl + AgolItemUrl + webmap + "/data?" + querystringContent; 
            try
            {
                using (var response = await _client.GetAsync(url).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<WebMapJson>(Formatters).ConfigureAwait(false);
                        Log.Debug("{Action} response {@Response}", "Get webmap json", result);

                        return result;
                    }
                    catch (Exception ex)
                    {
                        var content = response.Content.ReadAsStringAsync().Result;
                        Log.Error(ex, "Reading {Action} response {Url} {@Response}", "web map json", url, content);

                        return new WebMapJson
                        {
                            Error = new Error
                            {
                                Details = new List<string>
                                {
                                    ex.Message,
                                    content
                                }
                            }
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "{Action} webmap json for {Url}", "Fetching", url);

                return new WebMapJson
                {
                    Error = new Error
                    {
                        Message = ex.Message
                    }
                };
            }
        }

        public async Task<WebMapUpdateResponse> UpdateWebMapJsonFor(string webmap, MultipartFormDataContent formContent)
        {
            var url = AgolUrl + "content/users/woswald9/items/" + webmap + "/update";

            try
            {
                using (var response = await _client.PostAsync(url, formContent).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<WebMapUpdateResponse>(Formatters).ConfigureAwait(false);
                        Log.Debug("{Action} response {@Response}", "Get webmap json", result);

                        if (!result.Success)
                        {
                            Log.Warning("Bookmark not saved {@response}", result);
                        }

                        return result;
                    }
                    catch (Exception ex)
                    {
                        var content = response.Content.ReadAsStringAsync().Result;
                        Log.Error(ex, "Reading {Action} response {Url} {@Response}", "web map json", url, content);

                        return new WebMapUpdateResponse
                        {
                            Success = true
                        };
                    } 
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "{Action} webmap json for {Url} {@Payload}", "Updating", url, formContent);

                return new WebMapUpdateResponse
                {
                    Success = false
                };
            }
        }

        public async Task<string> GetToken()
        {
            Log.Verbose("GetToken");

            if (!string.IsNullOrEmpty(_currentToken))
            {
                var utcNow = DateTime.UtcNow;

                Log.Verbose("The time is {Now} and the token expires at {Expires}", utcNow, _expiresIn);

                if (utcNow < _expiresIn)
                {
                    Log.Debug("The current token is still valid.");

                    return _currentToken;
                }

                Log.Verbose("Requesting a new token");
            }

            Log.Debug("Requesting the first token");

            using (var formContent = new MultipartFormDataContent())
            {
                try
                {
                    formContent.Add(new StringContent(_credentials.Username), "client_id");
                    formContent.Add(new StringContent(_credentials.Password), "client_secret");
                    formContent.Add(new StringContent("2000"), "expiration");
                    formContent.Add(new StringContent("client_credentials"), "grant_type");
                    formContent.Add(new StringContent("json"), "f");
                }
                catch (ArgumentNullException ex)
                {
                    Log.Error(ex, "There was an issue creating the form content for {@User}", _credentials);
                    return null;
                }

                try
                {
                    var response = await _client.PostAsync(AgolUrl + TokenUrl, formContent).ConfigureAwait(false);
                    var tokenResponse = await response.Content.ReadAsAsync<OauthTokenResponse>(Formatters).ConfigureAwait(false);

                    Log.Debug("Token service response {@Response}", tokenResponse);

                    var expiresInSeconds = tokenResponse.Expires_In;
                    _expiresIn = DateTime.UtcNow + TimeSpan.FromSeconds(expiresInSeconds - OneHourBufferInSeconds);

                    return _currentToken = tokenResponse.Access_Token;
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Getting a token from {Url} {@Payload}", TokenUrl, formContent);
                    return null;
                }
            }
        }
    }
}