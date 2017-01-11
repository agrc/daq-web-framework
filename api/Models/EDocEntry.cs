using System;

namespace daq_api.Models
{
    public class EDocEntry
    {
        public int Id { get; set; }
        public string Path { get; set; }
        public string Title { get; set; }
        public DateTime DocumentDate { get; set; }
        public string Name { get; set; }
        public string Branch { get; set; }
    }
}