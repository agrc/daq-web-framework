namespace daq_api.Models
{
    public class OauthTokenResponse : Errorable
    {
        public string Access_Token { get; set; }
        public int Expires_In { get; set; }
    }
}