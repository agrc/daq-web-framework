using System.Collections.Generic;
using System.Threading.Tasks;
using daq_api.Models;

namespace daq_api.Contracts
{
    public interface IRepository
    {
        ///
        /// facility - the ai number from the feature service
        /// facilityId - the facility id from the feature service
        Task<IEnumerable<EDocEntry>> Get(string facility);
        EDocEntry Get(int id);
//        IEnumerable<EDocEntry> Get(IEnumerable<int> ids);
    }
}