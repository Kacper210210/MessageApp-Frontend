import React, { useState, useEffect } from 'react';
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
import ChatsPage from './Components/ChatsPage';

import Env from './.env';

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
          },
          {
            path: 'chats/*',
            element: <ChatsPage />
          }
        ]
      }
    ]
  }
]);

const fetchUser = async () => {
  try {
    const response = await fetch(`${Store.getState().baseUrl}/api/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if(response.status === 200) {
      const result = await response.json();

      Store.dispatch({ type: 'SET_USER', payload: result });
    }

    return response.status;
  } catch(err) {
    console.log(err);
  }
}

const fetchImage = async () => {
  try {
    const response = await fetch(`${Store.getState().baseUrl}/api/get_image`, {
      method: 'GET',
      credentials: 'include'
    });

    const result = await response.json();

    if(response.status === 200) {
      Store.dispatch({ type: 'SET_IMAGE', payload: result.image });
    }
  } catch(err) {
    console.log(err);
  }
}

export const fetchUserImage = async () => {
  const userStatus = await fetchUser();

  if(userStatus === 200) {
    await fetchImage();
  }
}

let unsubscribe = undefined;

let interval = undefined;

function App() {
  const [state, setState] = useState(Store.getState()); // Re-render component after dispatch

  useEffect(() => {
    if(unsubscribe != undefined) unsubscribe();

    unsubscribe = Store.subscribe(() => {
      setState(Store.getState());
    });

    // Fetch user and image every 30s
    fetchUserImage();

    if(interval != undefined) clearInterval(interval);

    interval = setInterval(async () => {
      await fetchUserImage();
    }, 30 * 1000);

    const fetchEnv = async () => {
      const response = await fetch(Env, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      let result = await response.text();

      result = result.replace('"', '');
      result = result.replace('\"', '');

      const results = result.split('\n');
      
      //console.log(results);

      const envVariables = {};

      for(let keyValuePair of results) {
        const pair = keyValuePair.split('=');

        envVariables[pair[0]] = pair[1].replace(/(\r\n|\n|\r)/gm, "");
      }

      Store.dispatch({ type: 'SET_ENV_VARIABLES', payload: envVariables });

      Store.dispatch({ type: 'SET_BASE_URL', payload: `https://${Store.getState().envVariables.server_address}:${Store.getState().envVariables.server_port}` });
    }

    fetchEnv();
  }, []);

  return (
    <Provider store={Store}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </Provider>
  );
}

export default App;