namespace daq_api.Models.WebMap
{
    public class OperationalLayer
    {
        public string Id { get; set; }
        public string LayerType { get; set; }
        public string Url { get; set; }
        public bool Visibility { get; set; }
        public double Opacity { get; set; }
        public string Title { get; set; }
        public string ItemId { get; set; }
        public LayerDefinition LayerDefinition { get; set; }
        public PopupInfo PopupInfo { get; set; }
    }
}