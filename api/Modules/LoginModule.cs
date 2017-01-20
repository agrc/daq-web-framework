using System;
using daq_api.Contracts;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Extensions;
using Nancy.Responses;

namespace daq_api.Modules
{
    public class LoginModule : NancyModule
    {
        public LoginModule(IUserDatabase userDatabase)
        {
            Get["/login"] = _ =>
            {
                if (Context.CurrentUser == null)
                {
                    return View["login"];
                }

                return Response.AsRedirect("~/daq/api", RedirectResponse.RedirectType.Temporary);
            };

            Get["/logout"] = _ => this.LogoutAndRedirect("~/login");

            Post["/login"] = _ =>
            {
                var userGuid = userDatabase.ValidateUser((string)Request.Form.Username, (string) Request.Form.Password);

                if (userGuid == null)
                {
                    return Context.GetRedirect("~/login?error=true&username=" + (string) Request.Form.Username);
                }

                DateTime? expiry = null;
                if (Request.Form.RememberMe.HasValue)
                {
                    expiry = DateTime.Now.AddDays(7);
                }

                return this.LoginAndRedirect(userGuid.Value, expiry, "~/");
            };
        }
    }
}