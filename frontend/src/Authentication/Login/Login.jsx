
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Header/Header';
import AxiosInstance from '../AxiosInstance';
import './styles.css';

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleOnChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await AxiosInstance.post(`/Users/login/`, loginData);

      const response = res.data;
      const user = {
        full_name: response.full_name,
        email: response.email,
      };
      if (res.status === 200) {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        localStorage.setItem('user', JSON.stringify(user));



        toast.success('Login successful');
        toast.success('تم تسجيل الدخول بنجاح', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        console.error('Error during login:', error);
        setErrorMessage('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقًا');
      }
    }
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-container">
          <div className="login-illustration">
            <h2>مرحبًا بك في لوحة التحكم</h2>
            <p>قم بتسجيل الدخول للوصول إلى نظام إدارة المتجر الخاص بك</p>
          </div>

          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">A</div>
              <h1 className="login-title">تسجيل الدخول</h1>
              <p className="login-subtitle">أدخل بياناتك للوصول إلى حسابك</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleOnChange}
                  placeholder="example@domain.com"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">كلمة المرور</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleOnChange}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="login-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">تذكرني</label>
                </div>
              </div>

              {errorMessage && (
                <div className="error-message">
                  <span>⚠</span> {errorMessage}
                </div>
              )}

              <button type="submit" className="login-btn">تسجيل الدخول</button>
            </form>
          </div>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
};

export default Login;