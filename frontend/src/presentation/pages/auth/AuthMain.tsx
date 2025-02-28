// import { useState, useRef } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { setUser } from '../../store/reducers/userReducer';
// import axiosInstance from '../../config/axiosConfig';
// import { loginAuthenticate, signUpAuthenticate } from '../../config/authenticateCondition';
// import OtpPage from './AuthSubFiles/OtpPage';
// import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
// import './auth.css';
// import GoogleAuth from './Google/GoogleAuth';
// import { showToast } from '../../Utils/toaster';
// import Loading from '../Loader/Loading';

// function AuthMain() {
//     const [showPassword, setShowPassword] = useState(false);
//     const [state, setState] = useState({
//         uiState: {
//             activeTab: 'signIn',
//             showOTPPage: false,
//             errors: {},
//             isLoading: false,
//             payload: null
//         },
//         formData: {
//             username: '',
//             email: '',
//             password: '',
//         },
//     });
//     const passwordInputRef = useRef(null);
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const handleKeyDown = (e, field) => {
//         if (e.key === 'Enter') {
//             if (field === 'email' && !state.uiState.errors.email) {
//                 passwordInputRef.current.focus();
//             } else if (field === 'password' && !state.uiState.errors.password && !state.uiState.errors.email) {
//                 handleSubmit();
//             }
//         }
//     };

//     const containerVariants = {
//         hidden: { opacity: 0 },
//         visible: {
//             opacity: 1,
//             transition: {
//                 duration: 0.6,
//                 staggerChildren: 0.1
//             }
//         }
//     };

//     const itemVariants = {
//         hidden: { y: 20, opacity: 0 },
//         visible: {
//             y: 0,
//             opacity: 1,
//             transition: {
//                 type: "spring",
//                 stiffness: 100
//             }
//         }
//     };


//     const updateState = (key, nestedKey, value) => {
//         setState((prevState) => {
//             const updatedState = {
//                 ...prevState,
//                 [key]: {
//                     ...prevState[key],
//                     [nestedKey]: value,
//                 },
//             };
//             if (key === 'formData' && prevState.uiState.errors[nestedKey]) {
//                 updatedState.uiState.errors = {
//                     ...prevState.uiState.errors
//                 };
//                 delete updatedState.uiState.errors[nestedKey];
//             }
//             return updatedState;
//         });
//     };

//     const handleSubmit = async () => {
//         let newErrors = {};
//         if (state.uiState.activeTab === 'signIn') {
//             newErrors = loginAuthenticate(state.formData.email, state.formData.password);
//         } else {
//             newErrors = signUpAuthenticate(
//                 state.formData.username,
//                 state.formData.email,
//                 state.formData.password,
//                 state.formData.confirmPassword
//             );
//         }

//         updateState('uiState', 'errors', newErrors);
//         if (Object.keys(newErrors).length === 0) {
//             if (state.uiState.activeTab === 'signIn') {
//                 updateState('uiState', 'isLoading', true);
//                 try {
//                     const loginData = {
//                         email: state.formData.email,
//                         password: state.formData.password,
//                     };

//                     const response = await axiosInstance.post('/login', loginData);
//                     if (response.data.status) {
//                         localStorage.setItem('accessToken', response.data.accessToken);
//                         dispatch(setUser(response.data.user));
//                         updateState('uiState', 'isLoading', false);
//                         navigate(response.data.control === 'user' ? "/" : "/admin");
//                     } else {
//                         updateState('uiState', 'isLoading', false);
//                         updateState('uiState', 'errors', { unAuthorised: 'Invalid credentials' });
//                     }
//                 } catch (error) {
//                     updateState('uiState', 'isLoading', false);
//                     if (error.response && error.response.status === 429) {
//                         updateState('uiState', 'errors', { unAuthorised: 'Too many attempts. Try again after 1 minutes' });
//                     } else
//                         updateState('uiState', 'errors', { unAuthorised: 'Login failed. Check your credentials.' });
//                 }
//             }
//         }
//     };

//     const handleGoogleSuccess = async (response) => {
//         try {
//             updateState('uiState', 'isLoading', true)
//             const res = await axiosInstance.post('/auth/google', {
//                 token: response.credential,
//             });
//             const data = res.data;
//             if (data.status) {
//                 dispatch(setUser(data.user));
//                 updateState('uiState', 'isLoading', false)

//                 localStorage.setItem('accessToken', data.accessToken);

//                 showToast('Login Successful', 'success')
//                 if (data.control === 'user') {
//                     navigate('/');
//                 } else {
//                     navigate('/admin');
//                 }
//             } else {
//                 updateState('uiState', 'isLoading', false)
//                 updateState('uiState', 'payload', data.payload);
//                 updateState('uiState', 'showOTPPage', true);
//             }
//         } catch (error) {
//             if (error.response && error.response.status === 429) {
//                 updateState('uiState', 'errors', { unAuthorised: 'Too many attempts. Try again after 15 minutes' });
//             } else
//                 updateState('uiState', 'errors', { unAuthorised: 'This account is not allowed' });
//             updateState('uiState', 'isLoading', false)
//         }
//     };

//     const handleGoogleFailure = () => {
//         showToast('Try Again Later', 'error')
//     };

//     return (
//         //AuthMain.jsx
//         <div className="auth__main-container">
//             <div className="auth__background">
//                 <div className="auth__background-overlay" />
//                 <motion.div
//                     className="auth__background-aurora auth__pulse-animation"
//                     animate={{
//                         scale: [1, 1.2, 1],
//                         opacity: [0.3, 0.6, 0.3]
//                     }}
//                     transition={{
//                         duration: 8,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                 />
//                 <motion.div
//                     className="auth__background-aurora--secondary auth__pulse-animation"
//                     animate={{
//                         scale: [1.2, 1, 1.2],
//                         opacity: [0.4, 0.7, 0.4]
//                     }}
//                     transition={{
//                         duration: 10,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                 />
//             </div>


//             <motion.div
//                 className="auth__card"
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//             >

//                 <motion.h1
//                     className="auth__title auth__gradient-animation"
//                     variants={itemVariants}
//                 >
//                     {state.uiState.activeTab === 'signIn' ? 'Welcome Back!' : 'Create Account'}
//                 </motion.h1>
//                 {/* {state.uiState.showOTPPage ? ( */}
//                 {state.uiState.showOTPPage && state.uiState.payload ? (
//                     <OtpPage payload={state.uiState.payload} />
//                 ) : (
//                     <>
//                         <motion.div
//                             className="auth__tabs"
//                             variants={itemVariants}
//                         >
//                             <button
//                                 className={`auth__tab-button ${state.uiState.activeTab === 'signIn' ? 'auth__tab-button--active' : ''}`}
//                                 onClick={() => setState(prev => ({
//                                     ...prev,
//                                     uiState: { ...prev.uiState, activeTab: 'signIn' }
//                                 }))}
//                             >
//                                 Sign In
//                             </button>
//                             <button
//                                 disabled={true}
//                                 className={`auth__tab-button ${state.uiState.activeTab === 'signUp' ? 'auth__tab-button--active' : ''}`}
//                                 onClick={() => setState(prev => ({
//                                     ...prev,
//                                     uiState: { ...prev.uiState, activeTab: 'signUp' }
//                                 }))}
//                             >
//                                 Sign Up
//                             </button>
//                         </motion.div>

//                         <motion.form
//                             className="auth__form"
//                             variants={itemVariants}
//                         >
//                             {state.uiState.activeTab === 'signUp' && (
//                                 <div className="auth__form-group">
//                                     <div className="auth__input-wrapper">
//                                         <input
//                                             type="text"
//                                             className="auth__input"
//                                             placeholder="Username"
//                                             value={state.formData.email}
//                                             onChange={(e) => updateState('formData', 'email', e.target.value)}
//                                             onKeyDown={(e) => handleKeyDown(e, 'email')}
//                                         />
//                                         <User className="auth__input-icon" />
//                                     </div>
//                                     {state.uiState.errors.username && (
//                                         <span className="auth__error-message">
//                                             <AlertCircle className="w-4 h-4" />
//                                             {state.uiState.errors.username}
//                                         </span>
//                                     )}
//                                 </div>
//                             )}

//                             <div className="auth__form-group">
//                                 <div className="auth__input-wrapper">
//                                     <input
//                                         type="email"
//                                         className="auth__input"
//                                         placeholder="Email"
//                                         ref={passwordInputRef}
//                                         value={state.formData.email}
//                                         onChange={(e) => updateState('formData', 'email', e.target.value)}
//                                         onKeyDown={(e) => handleKeyDown(e, 'email')}
//                                     />
//                                     <Mail className="auth__input-icon" />
//                                 </div>
//                                 {state.uiState.errors.email && (
//                                     <span className="auth__error-message">
//                                         <AlertCircle className="w-4 h-4" />
//                                         {state.uiState.errors.email}
//                                     </span>
//                                 )}
//                             </div>

//                             <div className="auth__form-group">
//                                 <div className="auth__input-wrapper">
//                                     <input
//                                         type={showPassword ? "text" : "password"}
//                                         className="auth__input"
//                                         placeholder="Password"
//                                         value={state.formData.password}
//                                         onChange={(e) => updateState('formData', 'password', e.target.value)}
//                                         onKeyDown={(e) => handleKeyDown(e, 'password')}
//                                     />
//                                     <Lock className="auth__input-icon" />
//                                     <button
//                                         type="button"
//                                         className="auth__password-toggle"
//                                         onClick={() => setShowPassword(!showPassword)}
//                                     >
//                                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                                     </button>
//                                 </div>
//                                 {state.uiState.errors.password && (
//                                     <span className="auth__error-message">
//                                         <AlertCircle className="w-4 h-4" />
//                                         {state.uiState.errors.password}
//                                     </span>
//                                 )}
//                             </div>

//                             <button
//                                 className="auth__submit-button"
//                                 disabled={state.uiState.isLoading}
//                                 onClick={(e) => { e.preventDefault(); handleSubmit(); }}
//                             >
//                                 {state.uiState.isLoading ? (
//                                     <Loading loading={true}/>
//                                 ) : (
//                                     state.uiState.activeTab === 'signIn' ? 'Sign In' : 'Create Account'
//                                 )}
//                             </button>
//                             <div className="d-flex mt-3 justify-content-center">
//                                 <GoogleAuth onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
//                             </div>
//                             <AnimatePresence>
//                                 {Object.keys(state.uiState.errors).length > 0 && state.uiState.errors.unAuthorised && (
//                                     <motion.div
//                                         className="auth__error-banner"
//                                         initial={{ opacity: 0, y: -10 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         exit={{ opacity: 0, y: -10 }}
//                                         transition={{ duration: 0.3, ease: "easeInOut" }}
//                                     >
//                                         {state.uiState.errors.unAuthorised}
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>
//                         </motion.form>
//                     </>
//                 )}
//                 <motion.p
//                     className="auth__copyright"
//                     variants={itemVariants}
//                 >
//                     © {new Date().getFullYear()} O`Legendary. All rights reserved.
//                 </motion.p>
//             </motion.div>
//         </div>
//     );
// }

// export default AuthMain;