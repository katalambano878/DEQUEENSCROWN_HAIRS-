'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminAccountPage() {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || '');
    });
  }, []);

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Sign in again before changing your password.' });
      return;
    }
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Enter your current password.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (password === currentPassword) {
      setMessage({ type: 'error', text: 'Choose a password that is different from your current one.' });
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        setMessage({ type: 'error', text: 'Current password is incorrect.' });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password updated. Use the new password the next time you sign in.' });
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Could not update password.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-sm text-gray-500 mt-1">Change the password for the admin account you are signed in with.</p>
      </div>

      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <i className="ri-lock-password-line text-xl text-gray-900"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change password</h2>
              <p className="text-sm text-gray-500 mt-0.5">{email || 'Signed-in admin'}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {message && (
            <div className={`p-4 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {message.text}
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="block text-sm font-semibold text-gray-700">Current password</span>
            <input
              type={inputType}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block text-sm font-semibold text-gray-700">New password</span>
            <input
              type={inputType}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block text-sm font-semibold text-gray-700">Confirm new password</span>
            <input
              type={inputType}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(event) => setShowPasswords(event.target.checked)}
              className="rounded border-gray-300"
            />
            Show passwords
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}
