using Nancy;
using Nancy.Security;

namespace daq_api.Modules
{
    public class HomeModule : NancyModule
    {
        public HomeModule()
        {
            this.RequiresAuthentication();

            Get["/"] = _ => View["index"];
        }
    }
}