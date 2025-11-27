import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

const LoginForm = ({ onSubmit, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(email, password, remember);
    setIsSubmitting(false);
  };

  return (
    <FormCard>
      <h2 className="login-title">Welcome to <span>DeskBuddy</span></h2>
      <p className="login-sub">Sign in to continue</p>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="input-group">
          <span className="input-icon"><FiMail /></span>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="input-group">
          <span className="input-icon"><FiLock /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="show-hide"
            onClick={() => setShowPassword(s => !s)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <div className="login-options">
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(r => !r)}
            />
            Remember me
          </label>
          <a href="#" className="forgot">Forgot password?</a>
        </div>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="login-btn" disabled={isSubmitting}>
          <FiLogIn style={{ marginRight: 8 }} />
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </FormCard>
  );
};

const FormCard = styled.div`
  position: relative;
  z-index: 10;
  min-width: 340px;
  max-width: 370px;
  margin: 0 auto;
  margin-top: 8vh;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 1.5rem;
  background: rgba(30, 30, 40, 0.55);
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18);
  border: 1.5px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(14px);
  display: flex;
  flex-direction: column;
  align-items: center;
  .login-title {
    font-size: 2.1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.2em;
    letter-spacing: 0.01em;
    span {
      color: #956afa;
      font-weight: 800;
    }
  }
  .login-sub {
    color: #e0e0e0cc;
    font-size: 1.1rem;
    margin-bottom: 1.5em;
    font-weight: 400;
  }
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.1em;
  }
  .input-group {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.08);
    border-radius: 0.8em;
    border: 1px solid rgba(255,255,255,0.13);
    padding: 0.2em 0.8em;
    margin-bottom: 0.1em;
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
    .input-icon {
      color: #b6aaff;
      font-size: 1.2em;
      margin-right: 0.5em;
    }
    .show-hide {
      background: none;
      border: none;
      color: #b6aaff;
      font-size: 1.2em;
      cursor: pointer;
      margin-left: 0.5em;
      outline: none;
      transition: color 0.2s;
      &:hover {
        color: #fff;
      }
    }
  }
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0.2em;
    .remember {
      color: #e0e0e0cc;
      font-size: 0.98em;
      display: flex;
      align-items: center;
      gap: 0.4em;
      input[type='checkbox'] {
        accent-color: #956afa;
        margin-right: 0.2em;
      }
    }
    .forgot {
      color: #b6aaff;
      font-size: 0.98em;
      text-decoration: none;
      transition: color 0.2s;
      &:hover {
        color: #fff;
      }
    }
  }
  .login-error {
    color: #ff6b6b;
    background: rgba(255,0,0,0.08);
    border-radius: 0.5em;
    padding: 0.5em 1em;
    font-size: 0.98em;
    margin-bottom: 0.2em;
    text-align: center;
  }
  .login-btn {
    width: 100%;
    background: linear-gradient(90deg, #956afa 0%, #6a8bfa 100%);
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
      background: linear-gradient(90deg, #6a8bfa 0%, #956afa 100%);
      box-shadow: 0 4px 24px 0 rgba(149,106,250,0.18);
    }
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
`;

export default LoginForm; 