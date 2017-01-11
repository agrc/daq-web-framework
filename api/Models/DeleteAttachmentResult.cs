namespace daq_api.Models
{
    public class DeleteAttachmentResult
    {
        public int ObjectId { get; set; }
        public object GlobalId { get; set; }
        public bool Success { get; set; }
        public Error Error { get; set; }
    }
}