import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";
import { useToast } from '../components/ToastProvider';
import VideoBackground from '../components/VideoBackground';
import styled from 'styled-components';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiArrowRight } from 'react-icons/fi';

// SVG ICONS
const UserIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><circle cx="12" cy="8" r="4"/><path d="M20 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"/></svg>
);
const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
);
const LockIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const EyeIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
);
const ArrowRightIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const CheckCircleIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 20} height={props.size || 20} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { login, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Check for OAuth error in URL params
    const oauthError = searchParams.get('error');
    const oauthMessage = searchParams.get('message');
    
    if (oauthError) {
      setError(oauthMessage || 'Authentication failed');
      addToast({ 
        type: 'error', 
        title: 'Authentication failed', 
        message: oauthMessage || 'Please try again',
        duration: 5000 
      });
    }
  }, [searchParams, addToast]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      // Note: Navigation will happen in AuthCallback component
      // The loginWithGoogle function redirects to Google OAuth
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again or use email login.');
      addToast({ type: 'error', title: 'Google login failed', message: 'Please try again or use email login.', duration: 3500 });
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError("");
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      addToast({ type: 'error', title: 'Please enter both email and password.', duration: 3500 });
      return;
    }
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      addToast({ type: 'success', title: 'Login Successful', duration: 3500 });
      navigate('/dashboard');
    } catch {
      setError('Login failed. Please check your email and password and try again.');
      addToast({ type: 'error', title: 'Login failed', message: 'Please check your email and password and try again.', duration: 3500 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill all fields.');
      addToast({ type: 'error', title: 'Please fill all fields.', duration: 3500 });
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      addToast({ type: 'error', title: 'Password must be at least 6 characters.', duration: 3500 });
      return;
    }
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      addToast({ type: 'success', title: 'Account Created', duration: 3500 });
      navigate('/dashboard');
    } catch {
      setError('Signup failed. Please check your details and try again. If the problem persists, contact support.');
      addToast({ type: 'error', title: 'Signup failed', message: 'Please check your details and try again. If the problem persists, contact support.', duration: 3500 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Enter email to reset.');
      addToast({ type: 'error', title: 'Enter email to reset', duration: 3500 });
      return;
    }
    try {
      // TODO: Implement password reset in backend
      setError('Password reset functionality will be available soon.');
      addToast({ type: 'info', title: 'Password reset functionality will be available soon.', duration: 3500 });
    } catch {
      setError('Failed to send reset link. Please check your email address and try again.');
      addToast({ type: 'error', title: 'Failed to send reset link', message: 'Please check your email address and try again.', duration: 3500 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await handleEmailLogin();
    } else {
      await handleSignup();
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (loginState) => {
    setIsLogin(loginState);
    setFormData({ email: "", password: "", name: "" });
    setError("");
  };

  if (!mounted) return null;

  return (
    <LoginBgWrap>
      <VideoBackground videoUrl="/LOGIN.mp4" />
      <FormWrap>
        <FormCard>
          <LogoRow>
            <LogoIcon><FiUser size={28} /></LogoIcon>
            <div>
              <BrandName>DeskBuddy</BrandName>
              <BrandTag>Your Productivity Partner</BrandTag>
            </div>
          </LogoRow>
          <WelcomeTitle>{isLogin ? "Welcome back" : "Get started"}</WelcomeTitle>
          <ToggleRow>
            <ToggleBtn active={isLogin} onClick={() => handleToggle(true)}>Sign In</ToggleBtn>
            <ToggleBtn active={!isLogin} onClick={() => handleToggle(false)}>Sign Up</ToggleBtn>
          </ToggleRow>
          <form onSubmit={handleSubmit} autoComplete="off">
          {!isLogin && (
              <InputGroup>
                <InputIcon><FiUser /></InputIcon>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  autoFocus={!isLogin}
                />
              </InputGroup>
            )}
            <InputGroup>
              <InputIcon><FiMail /></InputIcon>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoFocus={isLogin}
              />
            </InputGroup>
            <InputGroup>
              <InputIcon><FiLock /></InputIcon>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <ShowHideBtn type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </ShowHideBtn>
            </InputGroup>
            <OptionsRow>
              <label className="remember">
                <input type="checkbox" style={{ accentColor: '#956afa' }} />
                Keep me signed in
              </label>
              <ForgotLink href="#" onClick={handleResetPassword}>Forgot Password?</ForgotLink>
            </OptionsRow>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <SubmitBtn type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              <FiArrowRight style={{ marginLeft: 8 }} />
            </SubmitBtn>
        </form>
          <Divider><span>or continue with</span></Divider>
          <GoogleBtn type="button" onClick={handleGoogleLogin} disabled={isLoading}>
            <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: 8 }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </GoogleBtn>
        </FormCard>
      </FormWrap>
    </LoginBgWrap>
  );
};

// Styled-components for layout and form
const LoginBgWrap = styled.div`
  min-height: 100vh;
  width: 100vw;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
`;
const FormWrap = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
`;
const FormCard = styled.div`
  background: rgba(30, 30, 40, 0.55);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18);
  border: 1.5px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(14px);
  width: 410px;
  min-height: 600px;
  padding: 2.5rem 2.2rem 2.2rem 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 480px) {
    width: 95vw;
    min-width: unset;
    max-width: 410px;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    min-height: 0;
  }
`;
const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 0.7rem;
`;
const LogoIcon = styled.div`
  background: linear-gradient(135deg, #956afa 0%, #6a8bfa 100%);
  border-radius: 1.1rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 16px 0 rgba(149,106,250,0.18);
`;
const BrandName = styled.h1`
  font-size: 1.6rem;
  font-weight: 800;
  color: #7c5dfa;
  margin-bottom: 0.1em;
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;
const BrandTag = styled.p`
  color: #bdbdbd;
  font-size: 1.02rem;
  font-weight: 500;
`;
const WelcomeTitle = styled.h2`
  font-size: 1.45rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.2em;
  margin-top: 0.2em;
`;
const ToggleRow = styled.div`
  display: flex;
  width: 100%;
  background: rgba(255,255,255,0.04);
  border-radius: 0.9em;
  margin-bottom: 1.3em;
  border: 1px solid rgba(255,255,255,0.10);
  overflow: hidden;
`;
const ToggleBtn = styled.button`
  flex: 1;
  padding: 0.85em 0;
  font-size: 1.08em;
  font-weight: 600;
  color: ${({ active }) => (active ? '#7c5dfa' : '#bdbdbd')};
  background: ${({ active }) => (active ? '#fff' : 'transparent')};
  border: none;
  outline: none;
  cursor: pointer;
  box-shadow: ${({ active }) => (active ? '0 2px 8px 0 rgba(149,106,250,0.10)' : 'none')};
  transition: background 0.2s, color 0.2s;
`;
const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.04);
  border-radius: 0.8em;
  border: 1px solid rgba(255,255,255,0.13);
  padding: 0.2em 0.8em;
  margin-bottom: 1.1em;
  input {
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 1.08rem;
    padding: 0.85em 0.5em 0.85em 0.5em;
    width: 100%;
    font-family: inherit;
  }
`;
const InputIcon = styled.span`
  color: #b6aaff;
  font-size: 1.2em;
  margin-right: 0.5em;
`;
const ShowHideBtn = styled.button`
  background: none;
  border: none;
  color: #b6aaff;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: 0.5em;
  outline: none;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;
const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 0.2em;
  .remember {
    color: #bdbdbdcc;
    font-size: 0.98em;
    display: flex;
    align-items: center;
    gap: 0.4em;
    input[type='checkbox'] {
      accent-color: #956afa;
      margin-right: 0.2em;
    }
  }
`;
const ForgotLink = styled.a`
  color: #7c5dfa;
  font-size: 0.98em;
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;
const ErrorMsg = styled.div`
  color: #ff6b6b;
  background: rgba(255,0,0,0.08);
  border-radius: 0.5em;
  padding: 0.5em 1em;
  font-size: 0.98em;
  margin-bottom: 0.2em;
  text-align: center;
`;
const SubmitBtn = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #7c5dfa 0%, #6a8bfa 100%);
  color: #fff;
  font-size: 1.1em;
  font-weight: 600;
  border: none;
  border-radius: 0.8em;
  padding: 0.85em 0;
  margin-top: 0.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2em;
  box-shadow: 0 2px 12px 0 rgba(149,106,250,0.13);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: linear-gradient(90deg, #6a8bfa 0%, #7c5dfa 100%);
    box-shadow: 0 4px 24px 0 rgba(149,106,250,0.18);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
const Divider = styled.div`
  width: 100%;
  text-align: center;
  margin: 1.2em 0 0.7em 0;
  color: #bdbdbdcc;
  font-size: 1em;
  position: relative;
  span {
    background: rgba(30,30,40,0.55);
    padding: 0 1em;
    position: relative;
    z-index: 2;
  }
  &:before {
    content: '';
    position: absolute;
    left: 0; right: 0; top: 50%;
    height: 1px;
    background: rgba(255,255,255,0.10);
    z-index: 1;
  }
`;
const GoogleBtn = styled.button`
  width: 100%;
  background: #fff;
  color: #222;
  font-size: 1.08em;
  font-weight: 600;
  border: none;
  border-radius: 0.8em;
  padding: 0.85em 0;
  margin-top: 0.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2em;
  box-shadow: 0 2px 12px 0 rgba(149,106,250,0.10);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: #f3f3ff;
    box-shadow: 0 4px 24px 0 rgba(149,106,250,0.13);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default Login;
