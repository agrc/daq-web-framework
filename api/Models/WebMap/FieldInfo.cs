namespace daq_api.Models.WebMap
{
    public class FieldInfo
    {
        public string FieldName { get; set; }
        public string Label { get; set; }
        public bool IsEditable { get; set; }
        public string Tooltip { get; set; }
        public bool Visible { get; set; }
        public string StringFieldOption { get; set; }
        public bool IsEditableOnLayer { get; set; }
        public Format Format { get; set; }
    }
}