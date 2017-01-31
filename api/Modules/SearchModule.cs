using daq_api.Contracts;
using Nancy;

namespace daq_api.Modules
{
    public class SearchModule : NancyModule
    {
        public SearchModule(IRepository repo)
        {
            Get["/search/{facilityNumber}"] = _ =>
            {
                var facilityNumber = _.facilityNumber.ToString();

                var result = repo.Get(facilityNumber);

                return FormatterExtensions.AsJson(Response, result);
            };
        }
    }
}