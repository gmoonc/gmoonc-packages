import React from 'react';
import { RouteObject } from 'react-router-dom';
import { GmooncAppLayout } from '../../app/GMooncAppLayout';
import { GMooncLoginPage } from '../../pages/auth/GMooncLoginPage';
import { GMooncRegisterPage } from '../../pages/auth/GMooncRegisterPage';
import { GMooncForgotPasswordPage } from '../../pages/auth/GMooncForgotPasswordPage';
import { GMooncResetPasswordPage } from '../../pages/auth/GMooncResetPasswordPage';
import { GMooncLogoutPage } from '../../pages/auth/GMooncLogoutPage';
import { GMooncAppHomePage } from '../../pages/app/GMooncAppHomePage';
import { GMooncPermissionsPage } from '../../pages/app/admin/GMooncPermissionsPage';
import { GMooncAdminUsersPage } from '../../pages/app/admin/GMooncAdminUsersPage';
import { GMooncAdminAuthorizationsPage } from '../../pages/app/admin/GMooncAdminAuthorizationsPage';
import { GMooncAdminNotificationsPage } from '../../pages/app/admin/GMooncAdminNotificationsPage';
import { GMooncTechnicalMessagesPage } from '../../pages/app/technical/GMooncTechnicalMessagesPage';
import { GMooncCustomerMessagesPage } from '../../pages/app/customer/GMooncCustomerMessagesPage';
import { GMooncOfficeAccountPage } from '../../pages/app/office/GMooncOfficeAccountPage';
import { GMooncOfficeAboutPage } from '../../pages/app/office/GMooncOfficeAboutPage';

/**
 * Creates route objects for the gmoonc dashboard.
 * 
 * IMPORTANT: This function NEVER creates a route with path="/".
 * The dashboard is always nested under basePath (default "/app").
 * Auth routes are separate and do not conflict with the root path.
 * 
 * @param options - Configuration options
 * @param options.basePath - Base path for dashboard routes (default: "/app")
 * @returns Array of RouteObject[] compatible with React Router v6
 */
export function createGmooncRoutes(options?: { basePath?: string }): RouteObject[] {
  const basePath = options?.basePath || '/app';

  // Ensure basePath never equals "/" to avoid root conflicts
  const safeBasePath = basePath === '/' ? '/app' : basePath;

  return [
    // Auth routes (outside basePath, but still avoid "/" to be safe)
    {
      path: '/login',
      element: <GMooncLoginPage />
    },
    {
      path: '/register',
      element: <GMooncRegisterPage />
    },
    {
      path: '/forgot-password',
      element: <GMooncForgotPasswordPage />
    },
    {
      path: '/reset-password',
      element: <GMooncResetPasswordPage />
    },
    {
      path: '/logout',
      element: <GMooncLogoutPage />
    },
    // Dashboard routes (always nested under basePath, never "/")
    {
      path: safeBasePath,
      element: <GmooncAppLayout />,
      children: [
        {
          // Home page is an index route (no path="/")
          index: true,
          element: <GMooncAppHomePage />
        },
        {
          path: 'admin/users',
          element: <GMooncAdminUsersPage />
        },
        {
          path: 'admin/permissions',
          element: <GMooncPermissionsPage />
        },
        {
          path: 'admin/authorizations',
          element: <GMooncAdminAuthorizationsPage />
        },
        {
          path: 'admin/notifications',
          element: <GMooncAdminNotificationsPage />
        },
        {
          path: 'technical/messages',
          element: <GMooncTechnicalMessagesPage />
        },
        {
          path: 'customer/messages',
          element: <GMooncCustomerMessagesPage />
        },
        {
          path: 'office/account',
          element: <GMooncOfficeAccountPage />
        },
        {
          path: 'office/about',
          element: <GMooncOfficeAboutPage />
        }
      ]
    }
  ];
}
