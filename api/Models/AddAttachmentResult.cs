namespace daq_api.Models
{
    public class AddAttachmentResult {
    public int ObjectId { get; set; }
    public string GlobalId { get; set; }
    public bool Success { get; set; }
    public Error Error { get; set; }
  }
}