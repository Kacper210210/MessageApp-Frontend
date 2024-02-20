import React from 'react';
import './App.css';

import MainNavbar from './Components/MainNavbar';
import HomePage from './Components/HomePage';
import RegisterPage, { registerAction } from './Components/RegisterPage';
import LoginPage, { loginAction } from './Components/LoginPage';
import PasswordResetPage from './Components/PasswordResetPage';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
      }
    ]
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;