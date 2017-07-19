namespace daq_api.Models.WebMap
{
    public class WebMapUpdateResponse : Errorable
    {
        public bool Success { get; set; }
        public string Id { get; set; }
    }
}