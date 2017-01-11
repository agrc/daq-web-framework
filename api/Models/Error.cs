using System.Collections.Generic;

namespace daq_api.Models
{
    public class Error
    {
        public Error()
        {
            Details = new List<string>();
        }

        public int Code { get; set; }
        public string Message { get; set; }

        public string Messages
        {
            get
            {
                Details.Add(Message);
                return string.Join(" ", Details);
            }
        }

        public string MessageCode { get; set; }
        public List<string> Details { get; set; }
        public string Description { get; set; }
    }
}