namespace daq_api.Models.RouteModels
{
    public class UploadExternal : Tokenizable
    {
        public string ServiceUrl { get; set; }
        public int FeatureId { get; set; }
    }
}