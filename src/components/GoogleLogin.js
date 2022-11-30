import React, { useState, useEffect } from 'react';
import { gapi, loadAuth2 } from 'gapi-script'

import { UserCard } from './UserCard';
import './GoogleLogin.css';
import axios from 'axios';

export const GoogleLogin  = () => {
  const [user, setUser] = useState(null);

  const updateUser = (currentUser) => {
    const name = currentUser.getBasicProfile().getName();
    const profileImg = currentUser.getBasicProfile().getImageUrl();
    const email = currentUser.getBasicProfile().getEmail();
    const { id_token } = currentUser.getAuthResponse();
    setUser({
      name: name,
      profileImg: profileImg,
    });
    axios.post('http://localhost:3000/api/users/signIn', { data : {
      name,
      email,
      profileImg: profileImg,
      password: ''
    },
    idToken: id_token
  })
  };

  const attachSignin = (element, auth2) => {
    auth2.attachClickHandler(element, {},
      (googleUser) => {
        updateUser(googleUser);
      }, (error) => {
      console.log(JSON.stringify(error))
    });
  };

  const signOut = () => {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      setUser(null);
      console.log('User signed out.');
    });
  }

  useEffect(() => {
    const setAuth2 = async () => {
      const auth2 = await loadAuth2(gapi, process.env.REACT_APP_CLIENT_ID, '')
      if (auth2.isSignedIn.get()) {
          updateUser(auth2.currentUser.get())
      } else {
          attachSignin(document.getElementById('customBtn'), auth2);
      }
    }
    setAuth2();
  }, []);

  useEffect(() => {
    if (!user) {
      const setAuth2 = async () => {
        const auth2 = await loadAuth2(gapi, process.env.REACT_APP_CLIENT_ID, '')
        attachSignin(document.getElementById('customBtn'), auth2);
      }
      setAuth2();
    }
  }, [user])

  if(user) {
    return (
      <div className="container">
        <UserCard user={user} />
        <div id="" className="btn logout" onClick={signOut}>
          Logout
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div id="customBtn" className="btn login">
        Login
      </div>
    </div>
  );
}
