using Microsoft.AspNetCore.Mvc;

namespace daq.Controllers
{
    public class HomeController : Controller
    {
        [HttpGet()]
        public ViewResult Index() => View();

        [HttpPost()]
        public RedirectResult Login() => Redirect("http://localhost:8000/src");
    }
}