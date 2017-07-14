using System.Collections.Generic;

namespace daq_api.Models.WebMap
{
    public class WebMapJson : Errorable
    {
        public List<OperationalLayer> OperationalLayers { get; set; }
        public BaseMap BaseMap { get; set; }
        public SpatialReference SpatialReference { get; set; }
        public string AuthoringApp { get; set; }
        public string AuthoringAppVersion { get; set; }
        public string Version { get; set; }
        public List<Bookmark> Bookmarks { get; set; }
        public ApplicationProperties ApplicationProperties { get; set; }
    }
}