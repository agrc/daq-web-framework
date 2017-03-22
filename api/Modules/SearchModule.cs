using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using daq_api.Contracts;
using daq_api.Models;
using daq_api.Services;
using Nancy;

namespace daq_api.Modules
{
    public class SearchModule : NancyModule
    {
        public SearchModule(IRepository repo, ArcOnlineHttpClient client)
        {
            Get["/search/{facilityNumber}/facility/{facilityId}/feature/{featureId}", true] = async (_, ctx) =>
            {
                var facilityNumber = _.facilityNumber.ToString();
                var facilityId = _.facilityId.ToString();

                IEnumerable<EDocEntry> result = await repo.Get(facilityNumber).ConfigureAwait(false);

                // we don't have any documents so exit quickly
                if (!result.Any())
                {
                    return Response.AsJson(result);
                }

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
                ArcOnlineResponse<AttachmentResponse> response = await client.GetAttachmentsFor(url);

                // we don't have attachments exit early
                if (!response.Result.AttachmentGroups.Any() || !response.Result.AttachmentGroups[0].AttachmentInfos.Any())
                {
                    return Response.AsJson(result);
                }

                var filenames = response.Result.AttachmentGroups[0].AttachmentInfos.ToDictionary(key => string.Format("{0}?{1}", key.Name, key.Id), value => value.Id);

                return Response.AsJson(result.Select(mapped =>
                {
                    var updated = new EDocEntry(mapped, facilityId);
                    var uploads = filenames.Where(key =>
                    {
                        var name = key.Key.Split('?')[0];
                        return string.Compare(name, updated.File, StringComparison.InvariantCultureIgnoreCase) == 0;
                    }).ToList();

                    updated.Uploaded = uploads.Any();
                    if (updated.Uploaded)
                    {
                        updated.UploadId = uploads.First().Value;
                    }

                    return updated;
                }));
            };
        }
    }
}