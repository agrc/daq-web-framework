using System;
using System.Collections.Generic;
using System.Linq;
using daq_api.Contracts;
using daq_api.Models.RouteModels;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Security;

namespace daq_api.Services
{
    public class UserDatabase : IUserMapper, IUserDatabase
    {
        private readonly List<Tuple<string, string, Guid>> _users = new List<Tuple<string, string, Guid>>();

        public UserDatabase()
        {
            _users.Add(new Tuple<string, string, Guid>("admin", "password", new Guid("55E1E49E-B7E8-4EEA-8459-7A906AC4D4C0")));
        }

        public IUserIdentity GetUserFromIdentifier(Guid identifier, NancyContext context)
        {
            var userRecord = _users.FirstOrDefault(u => u.Item3 == identifier);

            return userRecord == null
                       ? null
                       : new User { UserName = userRecord.Item1 };
        }

        public Guid? ValidateUser(string username, string password)
        {
            var user = _users.FirstOrDefault(u => u.Item1 == username);

            if (user == null)
            {
                return null;
            }

            if (user.Item2 != password)
            {
                return null;
            }

            return user.Item3;
        }
    }
}