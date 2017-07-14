namespace daq_api.Models.WebMap
{
    public class FullExtent
    {
        public double Xmin { get; set; }
        public double Ymin { get; set; }
        public double Xmax { get; set; }
        public double Ymax { get; set; }
        public SpatialReference SpatialReference { get; set; }
    }
}