using Microsoft.AspNetCore.Mvc;
using daq.Services;
using System.Linq;
using System.Threading.Tasks;

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

        [HttpGet("~/api/search/{facilityNumber}/{featureId}")]
        public JsonResult Search(string facilityNumber, int featureId, string service)
        {
            var result = Repository.Get(facilityNumber);
            // var response = await Client.GetDocumentsFor(service, featureId).ConfigureAwait(false);

            return Json(result.ToList());
        }
    }
}
