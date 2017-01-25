using System.Collections.Generic;
using Nancy.Security;

namespace daq_api.Models.RouteModels
{
    public class User : IUserIdentity
    {
        public string UserName { get; set; }
        public IEnumerable<string> Claims { get; set; }
    }
}