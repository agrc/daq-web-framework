using System.Collections.Generic;

namespace daq_api.Models.WebMap
{
    public class Symbol
    {
        public List<int> Color { get; set; }
        public Outline Outline { get; set; }
        public string Type { get; set; }
        public string Style { get; set; }
        public double? Size { get; set; }
        public int? Angle { get; set; }
        public int? Xoffset { get; set; }
        public int? Yoffset { get; set; }
    }
}