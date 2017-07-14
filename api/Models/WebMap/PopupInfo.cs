using System.Collections.Generic;

namespace daq_api.Models.WebMap
{
    public class PopupInfo
    {
        public string Title { get; set; }
        public List<FieldInfo> FieldInfos { get; set; }
        public object Description { get; set; }
        public bool ShowAttachments { get; set; }
        public List<object> MediaInfos { get; set; }
    }
}