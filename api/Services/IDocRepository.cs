using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using daq.Models;

namespace daq.Services
{
    public interface IRepository
    {
        IEnumerable<EDocEntry> Get(string facility);
        EDocEntry Get(int id);
        IEnumerable<EDocEntry> Get(IEnumerable<int> ids);
    }

    public class StaticRepository : IRepository
    {
         List<EDocEntry> items = new List<EDocEntry> {
                new EDocEntry {
                    Title = "Brigham Young University Dry Cleaner-Inspection Memo",
                    Path = "/wwwroot/test/test.pdf",
                    DocumentDate = DateTime.Now,
                    Branch = "DAQ Branch",
                    Name = "10791",
                    Id = 1
                },
                new EDocEntry {
                    Title = "Test",
                    Path = "/wwwroot/test/test2.pdf",
                    DocumentDate = DateTime.Now,
                    Branch = "DAQ Branch",
                    Name = "10791",
                    Id = 2,
                },
                new EDocEntry {
                    Title = "Brigham Young University - Loses again",
                    Path = "/wwwroot/test/test.pdf",
                    DocumentDate = DateTime.Now,
                    Branch = "DAQ Branch",
                    Name = "2",
                    Id = 3
                },
                new EDocEntry {
                    Title = "Brigham Young University - Go Utes",
                    Path = "/wwwroot/test/test2.pdf",
                    DocumentDate = DateTime.Now,
                    Branch = "DAQ Branch",
                    Name = "2",
                    Id = 4
                }
            };

        public IEnumerable<EDocEntry> Get(string facility)
        {
            return items.Where(item => item.Name == facility);
        }

        public IEnumerable<EDocEntry> Get(IEnumerable<int> ids)
        {
            return items.Where(item => ids.Contains(item.Id));
        }

        public EDocEntry Get(int id)
        {
            return items.Single(item => item.Id == id);
        }
    }

    public class DocRepository : IRepository
    {
        private string ConnectionString { get; }

        public DocRepository ()
        {
            ConnectionString = daq.Startup.Configuration.GetSection("connectionStrings").Value;
        }

        public IEnumerable<EDocEntry> Get(string facility)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                return session.Query<EDocEntry>("SELECT id, facility_name as name, branch, title, CAST(document_date as datetime) as documentdate FROM Combined_DAQ where facility_number=@facility ORDER BY documentdate", new
                {
                    facility = facility
                }).ToList();
            }
        }

        public IEnumerable<EDocEntry> Get(IEnumerable<int> ids)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                return session.Query<EDocEntry>("SELECT r_folder_path + '/' + object_name + '.' + i_full_format as path FROM Combined_DAQ where ids IN @id", new
                {
                    ids = ids
                }).ToList();
            }
        }

        public EDocEntry Get(int id)
        {
            using (var session = new SqlConnection(ConnectionString))
            {
                return session.Query<EDocEntry>("SELECT r_folder_path + '/' + object_name + '.' + i_full_format as path FROM Combined_DAQ where ids = @id", new
                {
                    id = id
                }).Single();
            }
        }
    }
}
