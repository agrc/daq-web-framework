using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using daq_api.Models;
using daq_api.Services;
using Nancy;

namespace daq_api.Modules
{
    public class AttachmentModule : NancyModule
    {
        public AttachmentModule(ArcOnlineHttpClient client)
        {
            Get["/attachment/{featureId}", true] = async (_, ctx) =>
            {
                var token = await client.GetToken().ConfigureAwait(false);
                if (string.IsNullOrEmpty(token))
                {
                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "Your arcgis online token expired. Please sign in again."
                        }
                    });
                }

                var queryParams = new[]
                {
                    new KeyValuePair<string, string>("objectIds", _.featureId.ToString()),
                    new KeyValuePair<string, string>("f", "json"),
                    new KeyValuePair<string, string>("token", token)
                };

                const string attachmentUrl = "/queryAttachments";
                var formUrl = new FormUrlEncodedContent(queryParams);
                var querystringContent = await formUrl.ReadAsStringAsync();

                var url = string.Format("{0}/{1}?{2}", Request.Query["url"], attachmentUrl, querystringContent);
                ArcOnlineResponse<AttachmentResponse> response = await client.GetAttachmentsFor(url).ConfigureAwait(false);

                // we don't have attachments exit early
                if (!response.Result.AttachmentGroups.Any() || !response.Result.AttachmentGroups[0].AttachmentInfos.Any())
                {
                    return Response.AsJson(new string[0]);
                }

                queryParams = new[]
                {
                    new KeyValuePair<string, string>("token", token)
                };

                formUrl = new FormUrlEncodedContent(queryParams);
                querystringContent = await formUrl.ReadAsStringAsync();
                
                var files = response.Result.AttachmentGroups[0].AttachmentInfos
                    .Select(x => new {
                        name = x.Name.Split('x')[2], 
                        url = string.Format("{0}/{1}/attachments/{2}?{3}", Request.Query["url"], _.featureId.ToString(), x.Id, querystringContent)
                    });

                return Response.AsJson(new[] {files});
            };
        }
    }
}
