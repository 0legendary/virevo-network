import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { showToast } from '../../../Utils/toaster';

function GoogleAuth({ onSuccess }) {
  const handleGoogleLogin = (googleUserData) => {
    onSuccess(googleUserData);
  };

  const handleError = () => {
    showToast('Something went wrong','error')
  };
  return (
    <div>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={handleError}
          useOneTap
          shape="Rectangular"
          size="medium"
        />
      </GoogleOAuthProvider>
    </div>
  )
}

export default GoogleAuth
