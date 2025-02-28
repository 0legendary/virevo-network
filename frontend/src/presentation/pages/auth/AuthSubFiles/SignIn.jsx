import { useRef } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import GoogleAuth from '../Google/GoogleAuth';
import { showToast } from '../../../Utils/toaster';
import LoadingPage from '../../AnimationPages/Loading/LoadingPage';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/reducers/userReducer';

function SignIn({ state, updateState, handleSubmit }) {
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'email' && !state.uiState.errors.email) {
        passwordInputRef.current.focus();
      } else if (field === 'password' && !state.uiState.errors.password && !state.uiState.errors.email) {
        handleSubmit();
      }
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      updateState('uiState', 'isLoading', true)
      const res = await axiosInstance.post('/auth/google', {
        token: response.credential,
      });
      const data = res.data;
      if (data.status) {
        dispatch(setUser(data.user));
        updateState('uiState', 'isLoading', false)
        
        localStorage.setItem('accessToken', data.accessToken);

        showToast('Login Successful', 'success')
        if (data.control === 'user') {
          navigate('/');
        } else {
          navigate('/admin');
        }
      } else {
        updateState('uiState', 'isLoading', false)
        updateState('uiState', 'payload', data.payload);
        updateState('uiState', 'showOTPPage', true);
      }
    } catch {
      updateState('uiState', 'isLoading', false)
      showToast('This account is not allowed', 'error')
    }
  };

  const handleGoogleFailure = () => {
    showToast('Try Again Later', 'error')
  };

  return (
    //SignIn.jsx
    <div className="w-100 authPage">
      {state.uiState.isLoading && <LoadingPage isBlurr={true} />}
      <label htmlFor="email" className="text-start">
        Email
      </label>
      <input
        type="text"
        id="email"
        value={state.formData.email}
        onChange={(e) => updateState('formData', 'email', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'email')}
      />
      {state.uiState.errors.email && <div className="error">{state.uiState.errors.email}</div>}

      <label className="text-start" htmlFor="password">
        Password
      </label>
      <input
        type="password"
        id="password"
        ref={passwordInputRef}
        value={state.formData.password}
        onChange={(e) => updateState('formData', 'password', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'password')}
      />
      {state.uiState.errors.password && <div className="error">{state.uiState.errors.password}</div>}
      {state.uiState.errors.unAuthorised && (
        <p className="successMsg text-danger">{state.uiState.errors.unAuthorised}</p>
      )}

      <button
        className="btn btn-success"
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        disabled={state.uiState.errors.email || state.uiState.errors.password}
      >
        Submit
      </button>

      <div className="separator">
        <span>OR</span>
      </div>
      <div className="d-flex mt-3 justify-content-center">
        <GoogleAuth onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
      </div>
    </div>
  );
}

export default SignIn;

