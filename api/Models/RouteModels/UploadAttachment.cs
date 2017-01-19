namespace daq_api.Models.RouteModels
{
    public class UploadAttachment : Tokenizable
    {
        public string ServiceUrl { get; set; }
        public int Id { get; set; }
        public int FeatureId { get; set; }
    }
}