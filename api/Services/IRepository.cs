using System.Collections.Generic;
using daq_api.Models;

namespace daq_api.Services
{
    public interface IRepository
    {
        IEnumerable<EDocEntry> Get(string facility);
        EDocEntry Get(int id);
        IEnumerable<EDocEntry> Get(IEnumerable<int> ids);
    }
}