using System.Collections.Generic;

namespace daq_api.Models.WebMap
{
    public class BaseMap
    {
        public List<BaseMapLayer> BaseMapLayers { get; set; }
        public string Title { get; set; }
    }
}