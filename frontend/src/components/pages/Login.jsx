import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const navigate = useNavigate();

  if (localStorage.getItem('walmart_auth') === 'true') {
    navigate('/');
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/users');
      const users = await res.json();
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin();
        navigate('/');
      } else {
        setError('Invalid credentials.');
      }
    } catch {
      setError('Server error.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError('');
    if (!signUpEmail.endsWith('@walmart.com') || signUpPassword.length < 4) {
      setSignUpError('Use a Walmart staff email and a password of at least 4 characters.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: signUpEmail, password: signUpPassword }) });
      if (res.ok) {
        setShowSignUp(false);
        setEmail(signUpEmail);
        setPassword(signUpPassword);
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpError('');
      } else {
        setSignUpError('User already exists.');
      }
    } catch {
      setSignUpError('Server error.');
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ef 0%, #f8fafc 100%)' }}>
      {!showSignUp ? (
        <form className="card login-card" onSubmit={handleLogin} style={{ minWidth: 320, maxWidth: 400, width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Walmart Staff Login</h2>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@walmart.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          {error && <div className="status status-high" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>Login</button>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span>Don't have an account? </span>
            <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 1rem', fontSize: 14 }} onClick={() => setShowSignUp(true)}>Sign Up</button>
          </div>
        </form>
      ) : (
        <form className="card login-card" onSubmit={handleSignUp} style={{ minWidth: 320, maxWidth: 400, width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Walmart Staff Sign Up</h2>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} placeholder="name@walmart.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} placeholder="Password" required />
          </div>
          {signUpError && <div className="status status-high" style={{ marginBottom: 12 }}>{signUpError}</div>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>Sign Up</button>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 1rem', fontSize: 14 }} onClick={() => setShowSignUp(false)}>Back to Login</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login; 