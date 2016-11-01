using System.Collections.Generic;

namespace daq.Models
{
    public class DeleteAttachmentResult
    {
        public int ObjectId { get; set; }
        public object GlobalId { get; set; }
        public bool Success { get; set; }
        public Error Error { get; set; }
    }

    public class DeleteResponse : Errorable
    {
        public List<DeleteAttachmentResult> DeleteAttachmentResults { get; set; }
        public DeleteAttachmentResult DeleteAttachmentResult { get; set; }
    }
}