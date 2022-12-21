using System.Web.Mvc;

namespace DXWebApplication1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult RichEditPartial()
        {
            return PartialView("_RichEditPartial");
        }
    }
}
