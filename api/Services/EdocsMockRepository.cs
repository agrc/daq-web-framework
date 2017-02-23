using System;
using System.Collections.Generic;
using System.Linq;
using daq_api.Contracts;
using daq_api.Models;

namespace daq_api.Services
{
    public class EdocsMockRepository : IRepository
    {
        readonly List<EDocEntry> _items = new List<EDocEntry> {
            new EDocEntry {
                Title = "Citizen complaint dated 4/21/2014",
                Path = "DAQ\\Agency Interest\\10701-10800\\10791 - Utah Refractories Corporation- Brick Manufacturing - Lehi Plant\\Compliance\\DAQ-2010-002306.pdf",
                DocumentDate = DateTime.Now,
                Branch = "DAQ Branch",
                Name = "10791",
                Id = 1
            },
            new EDocEntry {
                Title = "N11805  H E Davis and Sons Temporary Relocation/Operation - Notice of Intent (NOI) - JPS Jaw Feeder Plant -  EL Jay 177 Standard Cone Crusher - Fab Tech Radial Stacker - Allis Chalmers 9167 Screen Plant - Simons 40693 Cone Screening Plant - Cat 750 KW Generator - 900 Amp. Motor Control Center",
                Path = "DAQ\\Agency Interest\\10701-10800\\10791 - Utah Refractories Corporation- Brick Manufacturing - Lehi Plant\\Compliance\\DAQ-2010-002306.pdf",
                DocumentDate = DateTime.Now,
                Branch = "DAQ Branch",
                Name = "10791",
                Id = 2,
            },
            new EDocEntry {
                Title = "Brigham Young University - Loses again",
                Path = "DAQ\\Agency Interest\\10701-10800\\10791 - Utah Refractories Corporation- Brick Manufacturing - Lehi Plant\\Compliance\\DAQ-2010-002306.pdf",
                DocumentDate = DateTime.Now,
                Branch = "DAQ Branch",
                Name = "2",
                Id = 3
            },
            new EDocEntry {
                Title = "Brigham Young University - Go Utes",
                Path = "DAQ\\Agency Interest\\10701-10800\\10791 - Utah Refractories Corporation- Brick Manufacturing - Lehi Plant\\Compliance\\DAQ-2010-002306.pdf",
                DocumentDate = DateTime.Now,
                Branch = "DAQ Branch",
                Name = "2",
                Id = 4
            }
        };

        public IEnumerable<EDocEntry> Get(string facility)
        {
            return _items.Where(item => item.Name == facility);
        }

        public IEnumerable<EDocEntry> Get(IEnumerable<int> ids)
        {
            return _items.Where(item => ids.Contains(item.Id));
        }

        public EDocEntry Get(int id)
        {
            return _items.Single(item => item.Id == id);
        }
    }
}