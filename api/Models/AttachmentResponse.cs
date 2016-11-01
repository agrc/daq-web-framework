using System.Collections.Generic;

namespace daq.Models
{
    public class AttachmentResponse : Errorable
    {
        public List<AttachmentGroup> AttachmentGroups { get; set; }
    }
    public class AttachmentGroup
    {
        public List<AttachmentInfo> AttachmentInfos { get; set; }
    }
    public class AttachmentInfo
    {
        public int Id { get; set; }
    }
}