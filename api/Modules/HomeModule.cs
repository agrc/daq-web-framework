using daq_api.Services;
using Nancy;

namespace daq_api.Modules
{
    public class HomeModule : NancyModule
    {
        public HomeModule(ArcOnlineHttpClient client)
        {
            Get["/", true] = async (_, ctx) =>
            {
                var token = await client.GetToken();

                return View["index", token];
            };
        }
    }
}