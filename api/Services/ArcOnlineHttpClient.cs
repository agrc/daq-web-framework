using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using daq_api.Contracts;
using daq_api.Formatters;
using daq_api.Models;

namespace daq_api.Services
{
    public class ArcOnlineHttpClient
    {
        private readonly HttpClient _client;
        private const string TokenUrl = "https://www.arcgis.com/sharing/rest/generateToken";
        private readonly IArcOnlineCredentials _credentials;

        public ArcOnlineHttpClient(IArcOnlineCredentials credentials)
        {
            _client = new HttpClient();
            _credentials = credentials;
            Formatters = new List<MediaTypeFormatter>
            {
                new PlainTextFormatter()
            };
        }

        private IEnumerable<MediaTypeFormatter> Formatters { get; set; }

        public async Task<ArcOnlineResponse<UploadResponse>> UploadDocument(string url, MultipartFormDataContent formContent)
        {
            try
            {
                using (var response = await _client.PostAsync(url, formContent).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<UploadResponse>(Formatters).ConfigureAwait(false);

                        return new ArcOnlineResponse<UploadResponse>(response, result);
                    }
                    catch (Exception ex)
                    {
                        return new ArcOnlineResponse<UploadResponse>(response, new UploadResponse
                        {
                            Error = new Error
                            {
                                Details = new List<string>
                                {
                                    ex.Message,
                                    response.Content.ReadAsStringAsync().Result
                                }
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
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
            try
            {
                using (var response = await _client.PostAsync(url, formContent).ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<DeleteResponse>(Formatters).ConfigureAwait(false);
                        result.DeleteAttachmentResult = result.DeleteAttachmentResults.Single();
                        result.DeleteAttachmentResults = null;

                        return new ArcOnlineResponse<DeleteResponse>(response, result);
                    }
                    catch (Exception ex)
                    {
                        return new ArcOnlineResponse<DeleteResponse>(response, new DeleteResponse
                        {
                            Error = new Error
                            {
                                Details = new List<string>
                                {
                                    ex.Message,
                                    response.Content.ReadAsStringAsync().Result
                                }
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return new ArcOnlineResponse<DeleteResponse>(null, new DeleteResponse
                {
                    Error = new Error
                    {
                        Message = ex.Message
                    }
                });
            }
        }

        public async Task<ArcOnlineResponse<AttachmentResponse>> GetDocumentsFor(string url, int featureId)
        {
            string query;
            var queryParams = new[]
            {
                new KeyValuePair<string, string>("objectIds", featureId.ToString()),
                new KeyValuePair<string, string>("f", "json")
                // new KeyValuePair<string, string>("token", ""),
            };

            try
            {
                using (var content = new FormUrlEncodedContent(queryParams))
                {
                    query = await content.ReadAsStringAsync();
                    using (var response = await _client.GetAsync(string.Format("{0}/queryAttachments?{1}", url, query)).ConfigureAwait(false))
                    {
                        try
                        {
                            var result = await response.Content.ReadAsAsync<AttachmentResponse>(Formatters).ConfigureAwait(false);

                            return new ArcOnlineResponse<AttachmentResponse>(response, result);
                        }
                        catch (Exception ex)
                        {
                            return new ArcOnlineResponse<AttachmentResponse>(response, new AttachmentResponse
                            {
                                Error = new Error
                                {
                                    Details = new List<string>
                                    {
                                        ex.Message,
                                        response.Content.ReadAsStringAsync().Result
                                    }
                                }
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return new ArcOnlineResponse<AttachmentResponse>(null, new AttachmentResponse
                {
                    Error = new Error
                    {
                        Message = ex.Message
                    }
                });
            }
        }

        public async Task<string> GetToken()
        {
            using (var formContent = new MultipartFormDataContent())
            {
                try
                {
                    formContent.Add(new StringContent(_credentials.Username), "username");
                    formContent.Add(new StringContent(_credentials.Password), "password");
                    formContent.Add(new StringContent("localhost"), "referer");
                    formContent.Add(new StringContent("gettoken"), "request");
                    formContent.Add(new StringContent("json"), "f");
                }
                catch (ArgumentNullException)
                {
                    return null;
                }

                try
                {
                    var response = await _client.PostAsync(TokenUrl, formContent).ConfigureAwait(false);
                    var tokenResponse = await response.Content.ReadAsAsync<TokenResponse>(Formatters).ConfigureAwait(false);

                    return tokenResponse.Token;
                }
                catch (Exception)
                {
                    return null;
                }
            }
        }
    }
}