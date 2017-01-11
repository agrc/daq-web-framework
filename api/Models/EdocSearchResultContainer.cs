using System.Collections.Generic;

namespace daq_api.Models
{
    public class EdocSearchResultContainer : Tokenizable
    {
        public List<EDocEntry> Results { get; set; }
        public int FeatureId { get; set; }
    }
}