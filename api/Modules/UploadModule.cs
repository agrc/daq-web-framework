﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using daq_api.Contracts;
using daq_api.Models;
using daq_api.Models.RouteModels;
using daq_api.Services;
using MimeTypes;
using Nancy;
using Nancy.ModelBinding;
using MimeTypes = Nancy.MimeTypes;

namespace daq_api.Modules
{
    public class UploadModule : NancyModule
    {
        public const int MaxUpload = 10485760;
        private const string AttachmentUrl = "/addAttachment";
        private const string DeleteAttachmentUrl = "/deleteAttachments";
        public IEnumerable<MediaTypeFormatter> Formatters { get; set; }

        public UploadModule(IRepository repository, IShareMappable edocFolder, ArcOnlineHttpClient client)
        {
            Post["/upload", true] = async (_, ctx) =>
            {
                var model = this.Bind<UploadAttachment>();
                var edoc = repository.Get(model.Id);
                var filename = Path.GetFileName(edoc.Path);

                var extension = Path.GetExtension(filename);
                var contentType = MimeTypeMap.GetMimeType(extension);

                try
                {
                    var token = await client.GetToken();
                    var file = edocFolder.GetPathFrom(edoc.Path);

                    // upload to arcgis online
                    using (Stream document = File.OpenRead(file))
                    using (var formContent = new MultipartFormDataContent())
                    {
                        try
                        {
                            var streamContent = new StreamContent(document);
                            streamContent.Headers.Add("Content-Type", contentType);
                            streamContent.Headers.Add("Content-Disposition", string.Format("form-data; name=\"file\"; filename=\"{0}\"", filename));
                            formContent.Add(streamContent, "file", filename);
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

                        var url = string.Format("{0}/{1}{2}", model.ServiceUrl, model.FeatureId, AttachmentUrl);
                        var response = await client.UploadDocument(url, formContent);

                        return Response.AsJson(response.Result);
                    }
                }
                catch (Exception ex)
                {
                    return Response.AsJson(new Errorable
                    {
                        Error = new Error
                        {
                            Message = string.Format("Unknown error getting EDocs File. {0}", ex.Message)
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

                    var url = string.Format("{0}/{1}{2}", model.ServiceUrl, model.FeatureId, DeleteAttachmentUrl);
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

                using (var document = attachment.Value)
                using (var formContent = new MultipartFormDataContent())
                {
                    try
                    {
                        var token = await client.GetToken();

                        var streamContent = new StreamContent(document);
                        streamContent.Headers.Add("Content-Type", contentType);
                        streamContent.Headers.Add("Content-Disposition", string.Format("form-data; name=\"file\"; filename=\"{0}\"", attachment.Name));
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

                    var url = string.Format("{0}/{1}{2}", model.ServiceUrl, model.FeatureId, AttachmentUrl);
                    var response = await client.UploadDocument(url, formContent);

                    return Response.AsJson(response.Result);
                }
            };
        }
    }
}