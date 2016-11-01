using System.Net.Http.Formatting;
using System.Net.Http.Headers;

namespace daq.Formatters
{
    public class PlainTextFormatter : JsonMediaTypeFormatter
    {
        public PlainTextFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/plain"));
        }
    }
}