using Nancy;
using Nancy.Responses;

namespace daq_api.Modules
{
    public class AppModule : NancyModule
    {
        public AppModule()
        {
            Before += _ =>
            {
                if (Context.CurrentUser == null)
                {
                    return Response.AsRedirect("/daq/api/login", RedirectResponse.RedirectType.Temporary);
                }

                return null;
            };

            Get["/"] = _ => View["app"];
        }
    }
}