using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using daq.Formatters;
using daq.Models;

namespace daq.Services
{
    public class ArcOnlineHttpClient
    {
        private HttpClient client;
        private IEnumerable<MediaTypeFormatter> Formatters { get; set; }
        public ArcOnlineHttpClient()
        {
            client = new HttpClient();
            Formatters = new List<MediaTypeFormatter>{
                new PlainTextFormatter ()
            };
        }

        public async Task<ArcOnlineResponse<UploadResponse>> UploadDocument(string url, MultipartFormDataContent formContent)
        {
            using (var response = await client.PostAsync(url, formContent).ConfigureAwait(false))
            {
                try
                {
                    var result = await response.Content.ReadAsAsync<UploadResponse>(Formatters).ConfigureAwait(false);

                    return new ArcOnlineResponse<UploadResponse>(response, result);
                }
                catch (Exception ex)
                {
                    return new ArcOnlineResponse<UploadResponse>(response, new Errorable
                    {
                        Error = new Error
                        {
                            Details = new List<string> {
                                    ex.Message,
                                    await response.Content.ReadAsStringAsync().ConfigureAwait(false)
                                }
                        }
                    } as UploadResponse);
                }
            }
        }

        public async Task<ArcOnlineResponse<DeleteResponse>> DeleteDocument(string url, MultipartFormDataContent formContent)
        {
            using (var response = await client.PostAsync(url, formContent).ConfigureAwait(false))
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
                    return new ArcOnlineResponse<DeleteResponse>(response, new Errorable
                    {
                        Error = new Error
                        {
                            Details = new List<string> {
                                    ex.Message,
                                    await response.Content.ReadAsStringAsync().ConfigureAwait(false)
                                }
                        }
                    } as DeleteResponse);
                }
            }
        }

        public async Task<ArcOnlineResponse<AttachmentResponse>> GetDocumentsFor(string url, int featureId)
        {
            string query;
            var queryParams = new KeyValuePair<string, string>[]{
                new KeyValuePair<string, string>("objectIds", featureId.ToString()),
                new KeyValuePair<string, string>("f", "json"),
                // new KeyValuePair<string, string>("token", ""),
            };

            using (var content = new FormUrlEncodedContent(queryParams))
            {
                query = await content.ReadAsStringAsync();
                using (var response = await client.GetAsync($"{url}/queryAttachments?{query}").ConfigureAwait(false))
                {
                    try
                    {
                        var result = await response.Content.ReadAsAsync<AttachmentResponse>(Formatters).ConfigureAwait(false);

                        return new ArcOnlineResponse<AttachmentResponse>(response, result);
                    }
                    catch (Exception ex)
                    {
                        return new ArcOnlineResponse<AttachmentResponse>(response, new Errorable
                        {
                            Error = new Error
                            {
                                Details = new List<string> {
                                    ex.Message,
                                    await response.Content.ReadAsStringAsync().ConfigureAwait(false)
                                }
                            }
                        } as AttachmentResponse);
                    }
                }
            }
        }
    }

    public class ArcOnlineResponse<T>
    {
        public HttpResponseMessage Http { get; set; }
        public T Result { get; set; }
        public ArcOnlineResponse(HttpResponseMessage response, T result)
        {
            Http = response;
            Result = result;
        }
    }
}