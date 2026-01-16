// Templates for 'add' command
export const CONFIG_TEMPLATE = `import { defineConfig } from "@gmoonc/core";

export const gmooncConfig = defineConfig({
  appName: "Dashboard",
  menu: [
    { id: "home", label: "Home", path: "/" },
    { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    { id: "admin", label: "Admin", path: "/admin", roles: ["admin"] }
  ]
});
`;

export const ADMIN_SHELL_TEMPLATE = `import React from "react";
import { GmooncShell } from "@gmoonc/ui";
import { gmooncConfig } from "./config";

export function AdminShell(props: { children?: React.ReactNode }) {
  const [activePath, setActivePath] = React.useState("/");

  return (
    <GmooncShell
      config={gmooncConfig}
      roles={["admin"]}
      activePath={activePath}
      onNavigate={(path) => setActivePath(path)}
    >
      {props.children ?? (
        <div style={{ padding: 16 }}>
          <h2>Goalmoon Ctrl (gmoonc)</h2>
          <p>Shell instalado com sucesso.</p>
          <p>activePath: {activePath}</p>
        </div>
      )}
    </GmooncShell>
  );
}
`;

// Templates for 'scaffold' command
export const CONFIG_TEMPLATE_SCAFFOLD = `import { defineConfig } from "@gmoonc/core";

export const gmooncConfig = defineConfig({
  appName: "Goalmoon Ctrl",
  menu: [
    {
      id: "admin",
      label: "Admin",
      path: "/app/admin",
      roles: ["admin"],
      submenu: [
        { id: "admin-users", label: "Users", path: "/app/admin/users" },
        { id: "admin-permissions", label: "Permissions", path: "/app/admin/permissions" },
        { id: "admin-authorizations", label: "Authorizations", path: "/app/admin/authorizations" },
        { id: "admin-notifications", label: "Notifications", path: "/app/admin/notifications" }
      ]
    },
    {
      id: "finance",
      label: "Finance",
      path: "/app/finance",
      submenu: [
        { id: "finance-exchange", label: "Exchange Rates", path: "/app/finance/exchange-rates" },
        { id: "finance-clients", label: "Clients", path: "/app/finance/clients" },
        { id: "finance-accounts", label: "Accounts", path: "/app/finance/accounts" },
        { id: "finance-locations", label: "Locations", path: "/app/finance/locations" },
        { id: "finance-currencies", label: "Currencies", path: "/app/finance/currencies" },
        { id: "finance-people", label: "People", path: "/app/finance/people" },
        { id: "finance-phones", label: "Phones", path: "/app/finance/phones" }
      ]
    },
    {
      id: "helpdesk",
      label: "Helpdesk",
      path: "/app/helpdesk",
      submenu: [
        { id: "helpdesk-incidents", label: "Incidents", path: "/app/helpdesk/incidents" },
        { id: "helpdesk-problems", label: "Problems", path: "/app/helpdesk/problems" }
      ]
    },
    {
      id: "office",
      label: "Office",
      path: "/app/office",
      submenu: [
        { id: "office-locations", label: "Locations", path: "/app/office/locations" },
        { id: "office-people", label: "People", path: "/app/office/people" },
        { id: "office-phones", label: "Phones", path: "/app/office/phones" },
        { id: "office-emails", label: "Emails", path: "/app/office/emails" },
        { id: "office-clients", label: "Clients", path: "/app/office/clients" },
        { id: "office-accounts", label: "Accounts", path: "/app/office/accounts" },
        { id: "office-notifications", label: "Notifications", path: "/app/office/notifications" }
      ]
    },
    {
      id: "technical",
      label: "Technical",
      path: "/app/technical",
      submenu: [
        { id: "technical-analyses", label: "Analyses", path: "/app/technical/analyses" },
        { id: "technical-messages", label: "Messages", path: "/app/technical/messages" },
        { id: "technical-equipment", label: "Equipment", path: "/app/technical/equipment" }
      ]
    },
    {
      id: "sales",
      label: "Sales",
      path: "/app/sales",
      submenu: [
        { id: "sales-proposals", label: "Proposals", path: "/app/sales/proposals" },
        { id: "sales-contracts", label: "Contracts", path: "/app/sales/contracts" },
        { id: "sales-clients", label: "Clients", path: "/app/sales/clients" }
      ]
    },
    {
      id: "customer",
      label: "Customer",
      path: "/app/customer",
      submenu: [
        { id: "customer-analyses", label: "Analyses", path: "/app/customer/analyses" },
        { id: "customer-messages", label: "Messages", path: "/app/customer/messages" }
      ]
    }
  ]
});
`;

export const APP_LAYOUT_TEMPLATE = `import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { GmooncShell } from "@gmoonc/ui";
import { gmooncConfig } from "./config";

export function GMooncAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <GmooncShell
      config={gmooncConfig}
      roles={["admin"]}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
      renderLink={({ path, label, isActive, onClick }) => (
        <button
          type="button"
          onClick={onClick}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            textDecoration: isActive ? "underline" : "none"
          }}
        >
          {label}
        </button>
      )}
    >
      <Outlet />
    </GmooncShell>
  );
}
`;

export const ROUTES_TEMPLATE = `import { RouteObject } from "react-router-dom";
import { GMooncAppLayout } from "./GMooncAppLayout";
import { GMooncLoginPage } from "./pages/auth/LoginPage";
import { GMooncLogoutPage } from "./pages/auth/LogoutPage";
import { GMooncRegisterPage } from "./pages/auth/RegisterPage";
import { GMooncForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { GMooncResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { GMooncConfirmPage } from "./pages/auth/ConfirmPage";
import { GMooncConfirmEmailPage } from "./pages/auth/ConfirmEmailPage";
import { GMooncEmailChangeInstructionsPage } from "./pages/auth/EmailChangeInstructionsPage";
import { GMooncAppHomePage } from "./pages/app/AppHomePage";
import { GMooncUsersPage } from "./pages/app/admin/UsersPage";
import { GMooncPermissionsPage } from "./pages/app/admin/PermissionsPage";
import { GMooncAuthorizationsPage } from "./pages/app/admin/AuthorizationsPage";
import { GMooncNotificationsPage as AdminNotificationsPage } from "./pages/app/admin/NotificationsPage";
import { GMooncExchangeRatesPage } from "./pages/app/finance/ExchangeRatesPage";
import { GMooncClientsPage as FinanceClientsPage } from "./pages/app/finance/ClientsPage";
import { GMooncAccountsPage as FinanceAccountsPage } from "./pages/app/finance/AccountsPage";
import { GMooncLocationsPage as FinanceLocationsPage } from "./pages/app/finance/LocationsPage";
import { GMooncCurrenciesPage } from "./pages/app/finance/CurrenciesPage";
import { GMooncPeoplePage as FinancePeoplePage } from "./pages/app/finance/PeoplePage";
import { GMooncPhonesPage as FinancePhonesPage } from "./pages/app/finance/PhonesPage";
import { GMooncIncidentsPage } from "./pages/app/helpdesk/IncidentsPage";
import { GMooncProblemsPage } from "./pages/app/helpdesk/ProblemsPage";
import { GMooncLocationsPage as OfficeLocationsPage } from "./pages/app/office/LocationsPage";
import { GMooncPeoplePage as OfficePeoplePage } from "./pages/app/office/PeoplePage";
import { GMooncPhonesPage as OfficePhonesPage } from "./pages/app/office/PhonesPage";
import { GMooncEmailsPage } from "./pages/app/office/EmailsPage";
import { GMooncClientsPage as OfficeClientsPage } from "./pages/app/office/ClientsPage";
import { GMooncAccountsPage as OfficeAccountsPage } from "./pages/app/office/AccountsPage";
import { GMooncNotificationsPage as OfficeNotificationsPage } from "./pages/app/office/NotificationsPage";
import { GMooncAnalysesPage as TechnicalAnalysesPage } from "./pages/app/technical/AnalysesPage";
import { GMooncMessagesPage as TechnicalMessagesPage } from "./pages/app/technical/MessagesPage";
import { GMooncEquipmentPage } from "./pages/app/technical/EquipmentPage";
import { GMooncProposalsPage } from "./pages/app/sales/ProposalsPage";
import { GMooncContractsPage } from "./pages/app/sales/ContractsPage";
import { GMooncClientsPage as SalesClientsPage } from "./pages/app/sales/ClientsPage";
import { GMooncAnalysesPage as CustomerAnalysesPage } from "./pages/app/customer/AnalysesPage";
import { GMooncMessagesPage as CustomerMessagesPage } from "./pages/app/customer/MessagesPage";

export function createGmooncRoutes(basePath: string = "{{BASE_PATH}}"): RouteObject[] {
  return [
    // Auth routes
    { path: "/login", element: <GMooncLoginPage /> },
    { path: "/logout", element: <GMooncLogoutPage /> },
    { path: "/register", element: <GMooncRegisterPage /> },
    { path: "/forgot-password", element: <GMooncForgotPasswordPage /> },
    { path: "/reset-password", element: <GMooncResetPasswordPage /> },
    { path: "/confirm", element: <GMooncConfirmPage /> },
    { path: "/confirm-email", element: <GMooncConfirmEmailPage /> },
    { path: "/email-change-instructions", element: <GMooncEmailChangeInstructionsPage /> },
    
    // App routes
    {
      path: basePath,
      element: <GMooncAppLayout />,
      children: [
        { index: true, element: <GMooncAppHomePage /> },
        // Admin
        { path: "admin/users", element: <GMooncUsersPage /> },
        { path: "admin/permissions", element: <GMooncPermissionsPage /> },
        { path: "admin/authorizations", element: <GMooncAuthorizationsPage /> },
        { path: "admin/notifications", element: <AdminNotificationsPage /> },
        // Finance
        { path: "finance/exchange-rates", element: <GMooncExchangeRatesPage /> },
        { path: "finance/clients", element: <FinanceClientsPage /> },
        { path: "finance/accounts", element: <FinanceAccountsPage /> },
        { path: "finance/locations", element: <FinanceLocationsPage /> },
        { path: "finance/currencies", element: <GMooncCurrenciesPage /> },
        { path: "finance/people", element: <FinancePeoplePage /> },
        { path: "finance/phones", element: <FinancePhonesPage /> },
        // Helpdesk
        { path: "helpdesk/incidents", element: <GMooncIncidentsPage /> },
        { path: "helpdesk/problems", element: <GMooncProblemsPage /> },
        // Office
        { path: "office/locations", element: <OfficeLocationsPage /> },
        { path: "office/people", element: <OfficePeoplePage /> },
        { path: "office/phones", element: <OfficePhonesPage /> },
        { path: "office/emails", element: <GMooncEmailsPage /> },
        { path: "office/clients", element: <OfficeClientsPage /> },
        { path: "office/accounts", element: <OfficeAccountsPage /> },
        { path: "office/notifications", element: <OfficeNotificationsPage /> },
        // Technical
        { path: "technical/analyses", element: <TechnicalAnalysesPage /> },
        { path: "technical/messages", element: <TechnicalMessagesPage /> },
        { path: "technical/equipment", element: <GMooncEquipmentPage /> },
        // Sales
        { path: "sales/proposals", element: <GMooncProposalsPage /> },
        { path: "sales/contracts", element: <GMooncContractsPage /> },
        { path: "sales/clients", element: <SalesClientsPage /> },
        // Customer
        { path: "customer/analyses", element: <CustomerAnalysesPage /> },
        { path: "customer/messages", element: <CustomerMessagesPage /> }
      ]
    }
  ];
}
`;

// Auth page templates
const createStubPage = (componentName: string, path: string) => `import React from "react";

export function ${componentName}() {
  return (
    <div style={{ padding: 24 }}>
      <h1>${componentName.replace('GMoonc', '').replace('Page', '')}</h1>
      <p>This is a stub page generated by gmoonc scaffold.</p>
      <p><strong>Path:</strong> ${path}</p>
    </div>
  );
}
`;

export const AUTH_PAGES_TEMPLATES: Record<string, string> = {
  'LoginPage.tsx': createStubPage('GMooncLoginPage', '/login'),
  'LogoutPage.tsx': `import React from "react";
import { Navigate } from "react-router-dom";

export function GMooncLogoutPage() {
  return <Navigate to="/login" replace />;
}
`,
  'RegisterPage.tsx': createStubPage('GMooncRegisterPage', '/register'),
  'ForgotPasswordPage.tsx': createStubPage('GMooncForgotPasswordPage', '/forgot-password'),
  'ResetPasswordPage.tsx': createStubPage('GMooncResetPasswordPage', '/reset-password'),
  'ConfirmPage.tsx': createStubPage('GMooncConfirmPage', '/confirm'),
  'ConfirmEmailPage.tsx': createStubPage('GMooncConfirmEmailPage', '/confirm-email'),
  'EmailChangeInstructionsPage.tsx': createStubPage('GMooncEmailChangeInstructionsPage', '/email-change-instructions')
};

// App page templates
const createAppStubPage = (componentName: string, path: string) => `import React from "react";

export function ${componentName}() {
  return (
    <div style={{ padding: 24 }}>
      <h1>${componentName.replace('GMoonc', '').replace('Page', '')}</h1>
      <p>This is a stub page generated by gmoonc scaffold.</p>
      <p><strong>Path:</strong> ${path}</p>
    </div>
  );
}
`;

export const APP_PAGES_TEMPLATES: Record<string, Record<string, string>> = {
  '': {
    'AppHomePage.tsx': createAppStubPage('GMooncAppHomePage', '/app')
  },
  'admin': {
    'UsersPage.tsx': createAppStubPage('GMooncUsersPage', '/app/admin/users'),
    'PermissionsPage.tsx': createAppStubPage('GMooncPermissionsPage', '/app/admin/permissions'),
    'AuthorizationsPage.tsx': createAppStubPage('GMooncAuthorizationsPage', '/app/admin/authorizations'),
    'NotificationsPage.tsx': createAppStubPage('GMooncNotificationsPage', '/app/admin/notifications')
  },
  'finance': {
    'ExchangeRatesPage.tsx': createAppStubPage('GMooncExchangeRatesPage', '/app/finance/exchange-rates'),
    'ClientsPage.tsx': createAppStubPage('GMooncClientsPage', '/app/finance/clients'),
    'AccountsPage.tsx': createAppStubPage('GMooncAccountsPage', '/app/finance/accounts'),
    'LocationsPage.tsx': createAppStubPage('GMooncLocationsPage', '/app/finance/locations'),
    'CurrenciesPage.tsx': createAppStubPage('GMooncCurrenciesPage', '/app/finance/currencies'),
    'PeoplePage.tsx': createAppStubPage('GMooncPeoplePage', '/app/finance/people'),
    'PhonesPage.tsx': createAppStubPage('GMooncPhonesPage', '/app/finance/phones')
  },
  'helpdesk': {
    'IncidentsPage.tsx': createAppStubPage('GMooncIncidentsPage', '/app/helpdesk/incidents'),
    'ProblemsPage.tsx': createAppStubPage('GMooncProblemsPage', '/app/helpdesk/problems')
  },
  'office': {
    'LocationsPage.tsx': createAppStubPage('GMooncLocationsPage', '/app/office/locations'),
    'PeoplePage.tsx': createAppStubPage('GMooncPeoplePage', '/app/office/people'),
    'PhonesPage.tsx': createAppStubPage('GMooncPhonesPage', '/app/office/phones'),
    'EmailsPage.tsx': createAppStubPage('GMooncEmailsPage', '/app/office/emails'),
    'ClientsPage.tsx': createAppStubPage('GMooncClientsPage', '/app/office/clients'),
    'AccountsPage.tsx': createAppStubPage('GMooncAccountsPage', '/app/office/accounts'),
    'NotificationsPage.tsx': createAppStubPage('GMooncNotificationsPage', '/app/office/notifications')
  },
  'technical': {
    'AnalysesPage.tsx': createAppStubPage('GMooncAnalysesPage', '/app/technical/analyses'),
    'MessagesPage.tsx': createAppStubPage('GMooncMessagesPage', '/app/technical/messages'),
    'EquipmentPage.tsx': createAppStubPage('GMooncEquipmentPage', '/app/technical/equipment')
  },
  'sales': {
    'ProposalsPage.tsx': createAppStubPage('GMooncProposalsPage', '/app/sales/proposals'),
    'ContractsPage.tsx': createAppStubPage('GMooncContractsPage', '/app/sales/contracts'),
    'ClientsPage.tsx': createAppStubPage('GMooncClientsPage', '/app/sales/clients')
  },
  'customer': {
    'AnalysesPage.tsx': createAppStubPage('GMooncAnalysesPage', '/app/customer/analyses'),
    'MessagesPage.tsx': createAppStubPage('GMooncMessagesPage', '/app/customer/messages')
  }
};
