namespace daq_api.Models.RouteModels
{
    public class RemoveAttachment : Tokenizable
    {
        public string ServiceUrl { get; set; }
        public int UploadId { get; set; }
        public int FeatureId { get; set; }
    }
}