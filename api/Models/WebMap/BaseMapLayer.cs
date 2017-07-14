namespace daq_api.Models.WebMap
{
    public class BaseMapLayer
    {
        public string Id { get; set; }
        public string LayerType { get; set; }
        public string Url { get; set; }
        public bool Visibility { get; set; }
        public int Opacity { get; set; }
        public string Title { get; set; }
        public string TemplateUrl { get; set; }
        public FullExtent FullExtent { get; set; }
        public TileInfo TileInfo { get; set; }
        public WmtsInfo WmtsInfo { get; set; }
        public string Type { get; set; }
        public bool? IsReference { get; set; }
        public string ItemId { get; set; }
    }
}