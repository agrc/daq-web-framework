namespace daq.Models {
  public class Credentials {
    public string Token { get; set; }
    public long Expiration { get; set; }
    public string UserId { get; set; }
    public bool SSL { get; set; }
  }
}