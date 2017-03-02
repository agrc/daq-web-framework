using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
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

        public IEnumerable<EDocEntry> Get(string facility)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                return session.Query<EDocEntry>("SELECT id, facility_name as name, branch, title, CAST(document_date as datetime) as documentdate FROM Combined_DAQ where facility_number=@facility ORDER BY documentdate", new
                {
                    facility
                }).ToList();
            }
        }

        public IEnumerable<EDocEntry> Get(IEnumerable<int> ids)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                return session.Query<EDocEntry>("SELECT id, title, r_folder_path + '/' + object_name + '.' + i_full_format as path FROM Combined_DAQ where id IN @ids", new
                {
                    ids
                }).ToList();
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