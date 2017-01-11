using System.Collections.Generic;

namespace daq_api.Models
{
    public class AttachmentResponse : Errorable
    {
        public List<AttachmentGroup> AttachmentGroups { get; set; }
    }
}