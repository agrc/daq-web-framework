using Nancy;

namespace daq_api.Modules
{
    public class HomeModule : NancyModule
    {
        public HomeModule()
        {
            Get["/"] = _ => View["home"];
        }
    }
}