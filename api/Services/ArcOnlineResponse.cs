using System.Net.Http;

namespace daq_api.Services
{
    public class ArcOnlineResponse<T>
    {
        public HttpResponseMessage Http { get; set; }
        public T Result { get; set; }
        public ArcOnlineResponse(HttpResponseMessage response, T result)
        {
            Http = response;
            Result = result;
        }
    }
}