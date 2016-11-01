using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using daq.Formatters;
using daq.Models;
using daq.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace daq.Controllers
{
    public class UploadController : Controller
    {
        // 10 megabytes converted to bytes
        public const int MaxUpload = 10485760;
        private const string AttachmentUrl = "/addAttachment";
        private const string DeleteAttachmentUrl = "/deleteAttachments";
        private IRepository repository { get; set; }
        private ArcOnlineHttpClient Client { get; set; }
        public IEnumerable<MediaTypeFormatter> Formatters { get; set; }
        public string BasePath { get; set; }

        public UploadController(IRepository repo, IHostingEnvironment env, ArcOnlineHttpClient client)
        {
            repository = repo;
            Client = client;
            BasePath = env.ContentRootPath;
        }

        [HttpPost("~/api/upload")]
        public async Task<JsonResult> Add(string serviceUrl, int id, int featureId, string token)
        {
            var edoc = repository.Get(id);
            var filename = Path.GetFileName(edoc.Path);
            var file = string.Format("{0}{1}", BasePath, edoc.Path);
            Stream document = System.IO.File.OpenRead(file);

            // upload to arcgis online
            using (MultipartFormDataContent formContent = new MultipartFormDataContent())
            {
                try
                {
                    var streamContent = new StreamContent(document);
                    streamContent.Headers.Add("Content-Type", "application/octet-stream");
                    streamContent.Headers.Add("Content-Disposition", $"form-data; name=\"file\"; filename=\"{filename}\"");
                    formContent.Add(streamContent, "file", filename);
                    formContent.Add(new StringContent("json"), "f");
                    // formContent.Add(new StringContent(token), "token");
                }
                catch (ArgumentNullException)
                {
                    return Json(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "Your arcgis online token expired. Please sign in again."
                        }
                    });
                }

                var response = await Client.UploadDocument($"{serviceUrl}/{featureId}{AttachmentUrl}", formContent);
                return Json(response.Result);
            }
        }

        [HttpDelete("~/api/upload")]
        public async Task<JsonResult> Remove(string serviceUrl, int uploadId, int featureId, string token)
        {
            using (MultipartFormDataContent formContent = new MultipartFormDataContent())
            {
                try
                {
                    formContent.Add(new StringContent("json"), "f");
                    formContent.Add(new StringContent(uploadId.ToString()), "attachmentIds");
                    // formContent.Add(new StringContent(token), "token");
                }
                catch (ArgumentNullException)
                {
                    return Json(new Errorable
                    {
                        Error = new Error
                        {
                            Message = "Your arcgis online token expired. Please sign in again."
                        }
                    });
                }

                var response = await Client.DeleteDocument($"{serviceUrl}/{featureId}{DeleteAttachmentUrl}", formContent);
                return Json(response.Result);
            }
        }
    }
}
