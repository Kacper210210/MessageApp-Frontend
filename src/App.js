import React, { useEffect } from 'react';
import './App.css';

import { Provider } from 'react-redux';

import Store from './Store';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainNavbar from './Components/MainNavbar';
import HomePage from './Components/HomePage';
import RegisterPage, { registerAction } from './Components/RegisterPage';
import LoginPage, { loginAction } from './Components/LoginPage';
import PasswordResetPage from './Components/PasswordResetPage';
import MessageAppPage from './Components/MessageAppPage';
import MessageAppHomePage from './Components/MessageAppHomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainNavbar />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/register',
        element: <RegisterPage />,
        action: registerAction
      },
      {
        path: '/login',
        element: <LoginPage />,
        action: loginAction
      },
      {
        path: '/passwordReset',
        element: <PasswordResetPage />
      },
      {
        path: '/messageApp',
        element: <MessageAppPage />,
        children: [
          {
            path: 'home',
            element: <MessageAppHomePage />
          }
        ]
      }
    ]
  }
]);

function App() {
  return (
    <Provider store={Store}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </Provider>
  );
}

export default App;