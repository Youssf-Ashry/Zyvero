import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthForm, AuthInput } from '../components/auth/AuthForm';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate((location.state as { from?: string })?.from ?? '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to continue building with your team."
      submitLabel={busy ? 'Signing in...' : 'Sign in'}
      error={error}
      onSubmit={submit}
      fields={
        <>
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} />
          <AuthInput label="Password" type="password" value={password} onChange={setPassword} />
        </>
      }
      footer={
        <p>
          New to Zyvero?{' '}
          <Link className="text-primary hover:text-primary-hover" to="/signup">
            Create an account
          </Link>
        </p>
      }
    />
  );
}
