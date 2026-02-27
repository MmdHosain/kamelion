// import { useState, useEffect } from 'react';
// import { sendOtp, verifyOtp } from '../api/auth';

// export const useAuth = () => {
//   const [user, setUser] = useState(null);
//   const [accessToken, setAccessToken] = useState(null);
//   const [authFlow, setAuthFlow] = useState(null); // 'login' | 'signup' | null
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [otpOpen, setOtpOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Load from session storage (not localStorage for security)
//   useEffect(() => {
//     const saved = sessionStorage.getItem('auth');
//     if (saved) {
//       const { user, accessToken } = JSON.parse(saved);
//       setUser(user);
//       setAccessToken(accessToken);
//     }
//   }, []);

//   // Save auth state
//   const saveAuth = (data) => {
//     setUser(data.user);
//     setAccessToken(data.accessToken || null);
//     sessionStorage.setItem(
//       'auth',
//       JSON.stringify({
//         user: data.user,
//         accessToken: data.accessToken || null,
//       })
//     );
//   };

//   // =========================
//   // OTP AUTH FLOW (EXISTING)
//   // =========================

//   const handleAuthSubmit = async (phone, flow) => {
//     setLoading(true);
//     setError(null);
//     try {
//       await sendOtp(phone, flow);
//       setPhoneNumber(phone);
//       setAuthFlow(flow);
//       setOtpOpen(true);
//     } catch (err) {
//       setError(err.response?.data?.message || 'خطا در ارسال کد');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async (code) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await verifyOtp(phoneNumber, code, authFlow);
//       saveAuth(data);
//       setOtpOpen(false);
//       setAuthFlow(null);
//     } catch (err) {
//       setError(err.response?.data?.message || 'کد اشتباه است');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // ADMIN / PASSWORD LOGIN
//   // =========================

//   const login = async (userData) => {
//     setLoading(true);
//     setError(null);

//     try {
//       /*
//         This is intentionally simple for now.
//         Replace this block with a real API call later.
//       */

//       saveAuth({
//         user: userData,
//         accessToken: null,
//       });
//     } catch (err) {
//       setError('Login failed');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================

//   const logout = () => {
//     setUser(null);
//     setAccessToken(null);
//     setAuthFlow(null);
//     setPhoneNumber('');
//     setOtpOpen(false);
//     sessionStorage.removeItem('auth');
//   };

//   return {
//     // State
//     user,
//     accessToken,
//     authFlow,
//     phoneNumber,
//     otpOpen,
//     loading,
//     error,

//     // OTP methods
//     handleAuthSubmit,
//     handleVerifyOtp,
//     setOtpOpen,

//     // Admin login
//     login,

//     // General
//     logout,
//   };
// };

export { useAuth } from '../context/AuthContext';
