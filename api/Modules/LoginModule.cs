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

                return Response.AsRedirect("~/daq", RedirectResponse.RedirectType.Temporary);
            };

            Get["/logout"] = _ => this.LogoutAndRedirect("~/login");

            Post["/login"] = _ =>
            {
                var username = (string)Request.Form.Username;
                var password = (string) Request.Form.Password;
                var userGuid = userDatabase.ValidateUser(username, password);

                if (userGuid == null)
                {
                    return Context.GetRedirect("~/login?error=true&username=" + username);
                }

                var expiry = DateTime.Now.AddDays(7);

                return this.LoginAndRedirect(userGuid.Value, expiry, "~/");
            };
        }
    }
}