using Nancy;
using Nancy.Responses;

namespace daq_api.Modules
{
    public class HomeModule : NancyModule
    {
        public HomeModule()
        {
            Get["/login"] = _ =>
            {
                if (Context.CurrentUser == null)
                {
                    return View["home"];
                }

                return Response.AsRedirect("daq/api/", RedirectResponse.RedirectType.Temporary);
            };
        }
    }
}