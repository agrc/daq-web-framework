﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Text.RegularExpressions;
using daq_api.Contracts;
using daq_api.Models;
using daq_api.Models.RouteModels;
using daq_api.Services;
using MimeTypes;
using Nancy;
using Nancy.ModelBinding;
using Serilog;

namespace daq_api.Modules
{
    public class UploadModule : NancyModule
    {
        public const int MaxUpload = 10485760;
        private const string AttachmentUrl = "/addAttachment";
        private const string DeleteAttachmentUrl = "/deleteAttachments";

        public UploadModule(IRepository repository, IShareMappable edocFolder, ArcOnlineHttpClient client)
        {
            Post["/upload", true] = async (_, ctx) =>
            {
                var model = this.Bind<UploadAttachment>();
                var edoc = repository.Get(model.Id);
                edoc = new EDocEntry(edoc, model.FacilityId);
                var filename = Path.GetFileName(edoc.Path);

                var extension = Path.GetExtension(filename);
                var contentType = MimeTypeMap.GetMimeType(extension);

                try
                {
                    var file = edocFolder.GetPathFrom(edoc.Path);
                    var fileInfo = new FileInfo(file);
                    var byteCount = fileInfo.Length;

                    if (byteCount > MaxUpload)
                    {
                        var readableSize = ReadableFileSizer.MakeReadable(byteCount);
                        Log.Warning("{file} is larger than allowed upload. {size}", edoc.Path, readableSize);

                        return Response.AsJson(new Errorable
                        {
                            Error = new Error
                            {
                                Message = $"This file is too large to be stored in ArcGIS Online. The file is around {readableSize} " +
                                          $"and the allowable size is {ReadableFileSizer.MakeReadable(MaxUpload)}."
                            }
                        });
                    }

                    var token = await client.GetToken();

                    // upload to arcgis online
                    using (Stream document = File.OpenRead(file))
                    using (var formContent = new MultipartFormDataContent())
                    {
                        try
                        {
                            var streamContent = new StreamContent(document);
                            streamContent.Headers.Add("Content-Type", contentType);
                            streamContent.Headers.Add("Content-Disposition", $"form-data; name=\"file\"; filename=\"{edoc.File}\"");
                            formContent.Add(streamContent, "file", edoc.File);
                            formContent.Add(new StringContent("json"), "f");
                            formContent.Add(new StringContent(token), "token");
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

                        var url = $"{model.ServiceUrl}/{model.FeatureId}{AttachmentUrl}";
                        var response = await client.UploadDocument(url, formContent).ConfigureAwait(false);

                        return Response.AsJson(response.Result);
                    }
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Unknown error getting EDocs File");
                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = $"Unknown error getting EDocs File. {ex.Message}"
                        }
                    });
                }
            };

            Delete["/upload", true] = async (_, ctx) =>
            {
                var model = this.Bind<RemoveAttachment>();
                using (var formContent = new MultipartFormDataContent())
                {
                    try
                    {
                        var token = await client.GetToken();
                        formContent.Add(new StringContent("json"), "f");
                        formContent.Add(new StringContent(model.UploadId.ToString()), "attachmentIds");
                        formContent.Add(new StringContent(token), "token");
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

                    var url = $"{model.ServiceUrl}/{model.FeatureId}{DeleteAttachmentUrl}";
                    var response = await client.DeleteDocument(url, formContent);

                    return Response.AsJson(response.Result);
                }
            };

            Post["/upload/external", true] = async (_, ctx) =>
            {
                var model = this.Bind<UploadExternal>();
                var attachment = Request.Files.SingleOrDefault();
                if (attachment == null || attachment.Value.Length < 1)
                {
                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "The file is empty."
                        }
                    });
                }

                var extension = Path.GetExtension(attachment.Name);
                var contentType = MimeTypeMap.GetMimeType(extension);

                if (string.IsNullOrEmpty(extension))
                {
                    extension = "";
                }

                var filename = attachment.Name.Replace(extension, "");
                var extLength = 0;

                if (!string.IsNullOrEmpty(extension))
                {
                    extLength = extension.Length;
                }

                const int maxSize = 100;
                var stripNonAlphaNumeric = new Regex("[^a-zA-Z0-9-]");
                var charactersAllowed = maxSize - extLength;
                var title = filename.Replace('/', '-');
                title = stripNonAlphaNumeric.Replace(title, "");

                if (title.Length > charactersAllowed)
                {
                    title = title.Substring(0, charactersAllowed);
                }

                var day = DateTime.Today.Day.ToString("d2");
                var month = DateTime.Today.Month.ToString("d2");

                var renamed = $"x{month}-{day}x{title}{extension}";

                using (var document = attachment.Value)
                using (var formContent = new MultipartFormDataContent())
                {
                    try
                    {
                        var token = await client.GetToken();

                        var streamContent = new StreamContent(document);
                        streamContent.Headers.Add("Content-Type", contentType);
                        streamContent.Headers.Add("Content-Disposition", $"form-data; name=\"file\"; filename=\"{renamed}\"");
                        formContent.Add(streamContent, "file", attachment.Name);
                        formContent.Add(new StringContent("json"), "f");
                        formContent.Add(new StringContent(token), "token");
                    }
                    catch (ArgumentNullException)
                    {
                        return Response.AsJson(new Errorable
                        {
                            Error = new Error
                            {
                                Message = "Your arcgis online token expired. Please sign in again."
                            }
                        });
                    }

                    var url = $"{model.ServiceUrl}/{model.FeatureId}{AttachmentUrl}";
                    var response = await client.UploadDocument(url, formContent);

                    return Response.AsJson(response.Result);
                }
            };
        }

        public IEnumerable<MediaTypeFormatter> Formatters { get; set; }
    }
}