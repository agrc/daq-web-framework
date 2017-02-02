﻿using System;
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
                Title = "Brigham Young University Dry Cleaner-Inspection Memo",
                Path = "DAQ\\Agency Interest\\10701-10800\\10791 - Utah Refractories Corporation- Brick Manufacturing - Lehi Plant\\Compliance\\DAQ-2010-002306.pdf",
                DocumentDate = DateTime.Now,
                Branch = "DAQ Branch",
                Name = "10791",
                Id = 1
            },
            new EDocEntry {
                Title = "Test",
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