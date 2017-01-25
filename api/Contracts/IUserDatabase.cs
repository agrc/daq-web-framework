using System;

namespace daq_api.Contracts
{
    public interface IUserDatabase
    {
        Guid? ValidateUser(string username, string password);
    }
}