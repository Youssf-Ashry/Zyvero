import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthForm, AuthInput } from '../components/auth/AuthForm';

export default function SignupPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await signUp(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthForm
      title="Create your workspace"
      subtitle="Start organizing your projects with Zyvero."
      submitLabel={busy ? 'Creating...' : 'Create account'}
      error={error}
      onSubmit={submit}
      fields={
        <>
          <AuthInput label="Name" value={name} onChange={setName} />
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} />
          <AuthInput
            label="Password (8+ characters, with a number)"
            type="password"
            value={password}
            onChange={setPassword}
          />
        </>
      }
      footer={
        <p>
          Already have an account?{' '}
          <Link className="text-primary hover:text-primary-hover" to="/login">
            Sign in
          </Link>
        </p>
      }
    />
  );
}
