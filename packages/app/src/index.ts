// Routes
export { createGmooncRoutes } from './routes/createGmooncRoutes';
export { GmooncRoutes } from './routes/GmooncRoutes';
export type { GmooncRoutesProps } from './routes/GmooncRoutes';

// Layout
export { GmooncAppLayout } from './layout/GMooncAppLayout';

// Config
export { defaultConfig } from './config/defaultConfig';
export { createDefaultMenu } from './app/menu/defaultMenu';
export type { MenuItemWithSubmenu } from './app/menu/defaultMenu';

// Session
export { GMooncSessionProvider, useGMooncSession } from './session/GMooncSessionContext';
export type { GMooncUser, GMooncSession } from './session/GMooncSessionContext';

// Pages (optional exports)
export { GMooncLoginPage } from './pages/auth/GMooncLoginPage';
export { GMooncRegisterPage } from './pages/auth/GMooncRegisterPage';
export { GMooncForgotPasswordPage } from './pages/auth/GMooncForgotPasswordPage';
export { GMooncResetPasswordPage } from './pages/auth/GMooncResetPasswordPage';
export { GMooncLogoutPage } from './pages/auth/GMooncLogoutPage';
export { GMooncAppHomePage } from './pages/app/GMooncAppHomePage';
export { GMooncPermissionsPage } from './pages/app/admin/GMooncPermissionsPage';
export { GMooncTechnicalMessagesPage } from './pages/app/technical/GMooncTechnicalMessagesPage';
export { GMooncCustomerMessagesPage } from './pages/app/customer/GMooncCustomerMessagesPage';

// Components (optional exports)
export { GMooncPermissionsManager } from './components/GMooncPermissionsManager';
export { GMooncMensagensTecnicasManager } from './components/GMooncMensagensTecnicasManager';
export { GMooncMensagensManager } from './components/GMooncMensagensManager';
export { GMooncMensagemForm } from './components/GMooncMensagemForm';
export { GMooncUserProfile } from './components/GMooncUserProfile';
