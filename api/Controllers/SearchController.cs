using Microsoft.AspNetCore.Mvc;
using daq.Services;
using System.Linq;

namespace daq.Controllers
{
    public class EdocsController : Controller
    {
        public EdocsController(IRepository repo, ArcOnlineHttpClient client)
        {
            Repository = repo;
            Client = client;
        }

        public ArcOnlineHttpClient Client { get; set; }
        public IRepository Repository { get; set; }

        [HttpGet("~/search/{facilityNumber}")]
        public JsonResult Search(string facilityNumber)
        {
            var result = Repository.Get(facilityNumber);
            // going to get documents fron a share not from http endpoint
            // var response = await Client.GetDocumentsFor(service, featureId).ConfigureAwait(false);

            return Json(result.ToList());
        }
    }
}
