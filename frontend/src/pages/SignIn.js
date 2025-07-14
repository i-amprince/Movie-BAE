import React, { useContext } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CLIENT_ID = '962287402478-e7vvcfana9h8mvp9vssm323cf9qdvjjj.apps.googleusercontent.com';

const SignIn = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      const decoded = jwtDecode(credentialResponse.credential);
      Cookies.set('jwt', credentialResponse.credential, { expires: 7 });
      setUser({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        token: credentialResponse.credential
      });
      // Upsert user in backend
      fetch('http://localhost:5000/api/users/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: decoded.name,
          email: decoded.email
        })
      });
      navigate('/');
    }
  };

  const handleError = () => {
    alert('Google sign-in failed.');
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)' }}>
        <div style={{ background: 'rgba(24,24,27,0.95)', padding: '2.5rem 2rem', borderRadius: '1.2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', maxWidth: 350, width: '100%', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: '2rem', letterSpacing: '0.5px' }}>Sign In</h2>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            width="100%"
            theme="filled_black"
            shape="pill"
            text="continue_with"
            logo_alignment="center"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn; 