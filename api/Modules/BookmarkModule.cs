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

            Post["bookmarks/add", true] = async (_, ctx) =>
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

                var webmaps = this.Bind<WebMapIds>();
                if (string.IsNullOrEmpty(webmaps.CollectorId) || string.IsNullOrEmpty(webmaps.DesktopId))
                {
                    Log.Warning("invalid web map ids {@Ids}", webmaps);

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

                Log.Debug("Getting webmap json for {Id}", webmaps.DesktopId);

                var desktopWebMap = await client.GetWebMapJsonFor(webmaps.DesktopId, token);

                Log.Debug("Getting webmap json for {Id}", webmaps.CollectorId);

                var collectorWebMap = await client.GetWebMapJsonFor(webmaps.CollectorId, token);

                if (desktopWebMap.Error != null)
                {
                    return Response.AsJson(desktopWebMap.Error);
                }

                if (collectorWebMap.Error != null)
                {
                    return Response.AsJson(collectorWebMap.Error);
                }

                desktopWebMap.Bookmarks.Add(model);
                collectorWebMap.Bookmarks = desktopWebMap.Bookmarks;

                Log.Debug("Updating webmap json for {Id}", webmaps.DesktopId);

                using (var formContent = new MultipartFormDataContent())
                using(var formContent2 = new MultipartFormDataContent())
                {
                    try
                    {
                        formContent.Add(new StringContent(JsonConvert.SerializeObject(desktopWebMap, 
                            Formatting.Indented, 
                            new JsonSerializerSettings
                            {
                                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
                                NullValueHandling = NullValueHandling.Ignore
                            })), "text");
                        formContent.Add(new StringContent(token), "token");
                        formContent.Add(new StringContent("json"), "f");

                        formContent2.Add(new StringContent(JsonConvert.SerializeObject(collectorWebMap,
                            Formatting.Indented,
                            new JsonSerializerSettings
                            {
                                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
                                NullValueHandling = NullValueHandling.Ignore
                            })), "text");
                        formContent2.Add(new StringContent(token), "token");
                        formContent2.Add(new StringContent("json"), "f");
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

                    var result = await client.UpdateWebMapJsonFor(webmaps.DesktopId, formContent);

                    if (!result.Success)
                    {
                        return result;
                    }
                    
                    result = await client.UpdateWebMapJsonFor(webmaps.CollectorId, formContent2);

                    if (!result.Success)
                    {
                        return result;
                    }

                    return Response.AsJson(desktopWebMap.Bookmarks);
                }
            };

            Delete["bookmarks/remove", true] = async (_, ctx) =>
            {
                var model = this.Bind<Bookmark>();
                if (string.IsNullOrEmpty(model.Name))
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

                var webmaps = this.Bind<WebMapIds>();
                if (string.IsNullOrEmpty(webmaps.CollectorId) || string.IsNullOrEmpty(webmaps.DesktopId))
                {
                    Log.Warning("invalid web map ids {@Ids}", webmaps);

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

                Log.Debug("Getting webmap json for {Id}", webmaps.DesktopId);

                var desktopWebMap = await client.GetWebMapJsonFor(webmaps.DesktopId, token);

                Log.Debug("Getting webmap json for {Id}", webmaps.CollectorId);

                var collectorWebMap = await client.GetWebMapJsonFor(webmaps.CollectorId, token);

                if (desktopWebMap.Error != null)
                {
                    return Response.AsJson(desktopWebMap.Error);
                }

                if (collectorWebMap.Error != null)
                {
                    return Response.AsJson(collectorWebMap.Error);
                }

                desktopWebMap.Bookmarks.RemoveAll(x => string.Equals(x.Name, model.Name, StringComparison.InvariantCultureIgnoreCase));
                collectorWebMap.Bookmarks = desktopWebMap.Bookmarks;

                Log.Debug("Updating webmap json for {Id}", desktopWebMap);

                using (var formContent = new MultipartFormDataContent())
                using (var formContent2 = new MultipartFormDataContent())
                {
                    try
                    {
                        formContent.Add(new StringContent(JsonConvert.SerializeObject(desktopWebMap,
                            Formatting.Indented,
                            new JsonSerializerSettings
                            {
                                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
                                NullValueHandling = NullValueHandling.Ignore
                            })), "text");
                        formContent.Add(new StringContent(token), "token");
                        formContent.Add(new StringContent("json"), "f");

                        formContent2.Add(new StringContent(JsonConvert.SerializeObject(collectorWebMap,
                            Formatting.Indented,
                            new JsonSerializerSettings
                            {
                                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
                                NullValueHandling = NullValueHandling.Ignore
                            })), "text");
                        formContent2.Add(new StringContent(token), "token");
                        formContent2.Add(new StringContent("json"), "f");
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

                    var result = await client.UpdateWebMapJsonFor(webmaps.DesktopId, formContent);

                    if (!result.Success)
                    {
                        return result;
                    }

                    result = await client.UpdateWebMapJsonFor(webmaps.CollectorId, formContent2);

                    if (!result.Success)
                    {
                        return result;
                    }

                    return Response.AsJson(desktopWebMap.Bookmarks);
                }
            };
        }
    }
}