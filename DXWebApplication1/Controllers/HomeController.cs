using DevExpress.Web.Mvc;
using DevExpress.XtraRichEdit;
using System.Web.Mvc;

namespace DXWebApplication1.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult RichEditPartial(string operation)
		{
			if (operation == "Save")
			{
				var data = RichEditExtension.SaveCopy("RichEditTest", DocumentFormat.Rtf);
				System.Diagnostics.Debug.WriteLine($"data.Length = {data.Length}");
			}
			return PartialView("_RichEditPartial");
		}

		[HttpPost]
		public ActionResult SaveRichEdit()
		{
			var data = RichEditExtension.SaveCopy("RichEditTest", DocumentFormat.Rtf);
			return Json(new { Length = data.Length });
		}
	}
}
