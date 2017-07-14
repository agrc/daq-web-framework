using System.Collections.Generic;

namespace daq_api.Models.WebMap
{
    public class Outline
    {
        public List<int> Color { get; set; }
        public double Width { get; set; }
        public string Type { get; set; }
        public string Style { get; set; }
    }
}