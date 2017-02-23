namespace daq_api.Models.RouteModels
{
    public class RemoveAttachment
    {
        public string ServiceUrl { get; set; }
        public int UploadId { get; set; }
        public int FeatureId { get; set; }
    }
}