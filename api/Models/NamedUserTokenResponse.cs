namespace daq_api.Models
{
    public class NamedUserTokenResponse : Errorable
    {
        public string Token { get; set; }
        public long Expires { get; set; }
    }
}