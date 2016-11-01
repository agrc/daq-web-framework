namespace daq.Models
{
  public class UploadResponse : Errorable {
    public AddAttachmentResult AddAttachmentResult { get; set; }
  }

  public class AddAttachmentResult {
    public int ObjectId { get; set; }
    public string GlobalId { get; set; }
    public bool Success { get; set; }
    public Error Error { get; set; }
  }
}
