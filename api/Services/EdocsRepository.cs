using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using daq_api.Contracts;
using daq_api.Models;
using Dapper;

namespace daq_api.Services
{
    public class EdocsRepository : IRepository
    {
        private string ConnectionString { get; set; }

        public EdocsRepository()
        {
            ConnectionString = ConfigurationManager.ConnectionStrings["edocs"].ConnectionString;
        }

        public async Task<IEnumerable<EDocEntry>> Get(string facility)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                var results = await session.QueryAsync<EDocEntry>("SELECT id, facility_name as name, branch, title, r_folder_path + '/' + object_name + '.' + i_full_format as path, CAST(document_date as datetime) as documentdate FROM Combined_DAQ where facility_number=@facility ORDER BY documentdate", new
                {
                    facility
                });

                return results; 
            }
        }

        public EDocEntry Get(int id)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                return session.Query<EDocEntry>("SELECT id, title, r_folder_path + '/' + object_name + '.' + i_full_format as path FROM Combined_DAQ where id = @id", new
                {
                    id
                }).Single();
            }
        }
    }
}