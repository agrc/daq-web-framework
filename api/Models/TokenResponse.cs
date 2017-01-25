namespace daq_api.Models
{
    public class TokenResponse : Errorable
    {
        public string Token { get; set; }
        public long Expires { get; set; }
        public bool Ssl { get; set; }
    }
}