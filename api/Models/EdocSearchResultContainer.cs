using System.Collections.Generic;

namespace daq.Models {

  public class EdocSearchResultContainer : Tokenizable {
    public List<EDocEntry> Results { get; set; }
    public int FeatureId { get; set; }
  }
}