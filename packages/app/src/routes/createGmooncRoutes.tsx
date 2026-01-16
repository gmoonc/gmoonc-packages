import React from 'react';
import { RouteObject } from 'react-router-dom';
import { GmooncAppLayout } from '../layout/GMooncAppLayout';
import { GMooncLoginPage } from '../pages/auth/GMooncLoginPage';
import { GMooncRegisterPage } from '../pages/auth/GMooncRegisterPage';
import { GMooncForgotPasswordPage } from '../pages/auth/GMooncForgotPasswordPage';
import { GMooncResetPasswordPage } from '../pages/auth/GMooncResetPasswordPage';
import { GMooncLogoutPage } from '../pages/auth/GMooncLogoutPage';
import { GMooncAppHomePage } from '../pages/app/GMooncAppHomePage';
import { GMooncPermissionsPage } from '../pages/app/admin/GMooncPermissionsPage';
import { GMooncTechnicalMessagesPage } from '../pages/app/technical/GMooncTechnicalMessagesPage';
import { GMooncCustomerMessagesPage } from '../pages/app/customer/GMooncCustomerMessagesPage';

export function createGmooncRoutes(options?: { basePath?: string }): RouteObject[] {
  const basePath = options?.basePath || '/app';

  return [
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
    {
      path: basePath,
      element: <GmooncAppLayout />,
      children: [
        {
          index: true,
          element: <GMooncAppHomePage />
        },
        {
          path: 'admin/permissions',
          element: <GMooncPermissionsPage />
        },
        {
          path: 'technical/messages',
          element: <GMooncTechnicalMessagesPage />
        },
        {
          path: 'customer/messages',
          element: <GMooncCustomerMessagesPage />
        }
      ]
    }
  ];
}
