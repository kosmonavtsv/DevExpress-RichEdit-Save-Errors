using System;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using DevExpress.Security.Resources;
using DevExpress.XtraReports.Web;

namespace DXWebApplication1
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            #region not impotant
            AreaRegistration.RegisterAllAreas();

            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            ModelBinders.Binders.DefaultBinder = new DevExpress.Web.Mvc.DevExpressEditorsBinder();
            #endregion

            // Workaround
            //AccessSettings.StaticResources.SetRules(new WorkaroundAccessRule());

            // The following line executes static initializator:
            /*
              static ReportViewer()
              {
                ...
                AccessSettings.StaticResources.TrySetRules((IAccessRule) UrlAccessRule.Allow());
              }
             */
            var _ = new ReportViewer();
        }
    }

    public class WorkaroundAccessRule : IUriAccessRule
    {
        public AccessPermission Permission => AccessPermission.Allow;

        public bool CheckUri(Uri uri)
        {
            return true;
        }
    }
}
