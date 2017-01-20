using daq_api.Models.RouteModels;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Responses;

namespace daq_api.Modules
{
    public class LoginModule : NancyModule
    {
        public LoginModule()
        {
            Get["/login"] = _ =>
            {
                if (Context.CurrentUser == null)
                {
                    return View["login"];
                }

                return Response.AsRedirect("daq/api/", RedirectResponse.RedirectType.Temporary);
            };

            Post["/login"] = _ =>
            {
                var user = this.Bind<UserLogin>();

                return Response.AsRedirect("/daq/api", RedirectResponse.RedirectType.Temporary);
            };
        }
    }
}