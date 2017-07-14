using System.Collections.Generic;

namespace daq_api.Models.WebMap
{
    public class TileInfo
    {
        public int Rows { get; set; }
        public int Cols { get; set; }
        public int Dpi { get; set; }
        public Origin Origin { get; set; }
        public SpatialReference SpatialReference { get; set; }
        public List<Lod> Lods { get; set; }
    }
}