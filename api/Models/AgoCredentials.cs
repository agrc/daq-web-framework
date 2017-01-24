using System;
using System.Configuration;
using daq_api.Contracts;

namespace daq_api.Models
{
    public class AgoCredentials : IArcOnlineCredentials
    {
        public string Username
        {
            get { return ConfigurationManager.AppSettings["ago_user"]; }
            set { throw new NotImplementedException(); }
        }

        public string Password
        {
            get { return ConfigurationManager.AppSettings["ago_password"]; }
            set { throw new NotImplementedException(); }
        }
    }
}