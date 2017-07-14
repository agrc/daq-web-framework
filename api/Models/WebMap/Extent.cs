namespace daq_api.Models.WebMap
{
    public class Extent
    {
        public SpatialReference SpatialReference { get; set; }
        public double Xmax { get; set; }
        public double Xmin { get; set; }
        public double Ymax { get; set; }
        public double Ymin { get; set; }
    }
}