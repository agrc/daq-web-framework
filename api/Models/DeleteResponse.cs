using System.Collections.Generic;

namespace daq_api.Models
{
    public class DeleteResponse : Errorable
    {
        public List<DeleteAttachmentResult> DeleteAttachmentResults { get; set; }
        public DeleteAttachmentResult DeleteAttachmentResult { get; set; }
    }
}