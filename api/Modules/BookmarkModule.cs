using System;
using System.Net.Http;
using daq_api.Models;
using daq_api.Models.WebMap;
using daq_api.Services;
using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json;
using Serilog;

namespace daq_api.Modules
{
    public class BookmarkModule : NancyModule
    {
        public BookmarkModule(ArcOnlineHttpClient client)
        {
            Get["/bookmarks/{webmapid}", true] = async (_, ctx) =>
            {
                var token = await client.GetToken().ConfigureAwait(false);

                if (string.IsNullOrEmpty(token))
                {
                    Log.Warning("Token Expired");

                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "Your arcgis online token expired. Please sign in again."
                        }
                    });
                }

                string webmapid = _.webmapid.ToString();
                Log.Debug("Getting webmap json for {Id}", webmapid);

                var webmap = await client.GetWebMapJsonFor(webmapid, token);

                return Response.AsJson(webmap.Bookmarks);
            };

            Post["bookmarks/{webmapid}/add", true] = async (_, ctx) =>
            {
                var model = this.Bind<Bookmark>();
                if (model.Extent == null || string.IsNullOrEmpty(model.Name))
                {
                    Log.Warning("invalid bookmark");

                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "Your bookmark is missing an extent or a name."
                        }
                    });
                }

                var token = await client.GetToken().ConfigureAwait(false);

                if (string.IsNullOrEmpty(token))
                {
                    Log.Warning("Token Expired");

                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "Your arcgis online token expired. Please sign in again."
                        }
                    });
                }

                string webmapid = _.webmapid.ToString();
                Log.Debug("Getting webmap json for {Id}", webmapid);

                var webmap = await client.GetWebMapJsonFor(webmapid, token);

                if (webmap.Error != null)
                {
                    return Response.AsJson(webmap.Error);
                }

                webmap.Bookmarks.Add(model);

                Log.Debug("Updating webmap json for {Id}", webmapid);

                using (var formContent = new MultipartFormDataContent())
                {
                    try
                    {
                        formContent.Add(new StringContent(JsonConvert.SerializeObject(webmap, 
                            Formatting.Indented, 
                            new JsonSerializerSettings
                            {
                                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                            })), "text");
                        formContent.Add(new StringContent(token), "token");
                        formContent.Add(new StringContent("json"), "f");
                    }
                    catch (ArgumentNullException ex)
                    {
                        Log.Error(ex, "Token expired?");
                        return Response.AsJson(new Errorable
                        {
                            Error = new Error
                            {
                                Message = "Your arcgis online token expired. Please sign in again."
                            }
                        });
                    }

                    var result = await client.UpdateWebMapJsonFor(webmapid, formContent);

                    if (result.Success)
                    {
                        return HttpStatusCode.Created;
                    }

                    return result;
                }
            };
        }
    }
}