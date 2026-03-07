import { useState } from 'react';
import { supabase } from './supabaseClient';
import './Auth.css';

export default function Auth({ onLogin, onClose }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    onLogin(data.user);
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ text: 'Success! You can now log in.', type: 'success' });
                setIsLogin(true);
            }
        } catch (error) {
            setMessage({ text: error.error_description || error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" onClick={(e) => { if (e.target.className === 'auth-container') onClose(); }}>
            <div className="auth-card">
                <button className="auth-close" onClick={onClose}>✕</button>
                <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
                <p className="auth-subtitle">TTRPG Map Forge &middot; Cloud Saves</p>

                {message.text && (
                    <div className={`auth-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleAuth}>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-toggle">
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => { setIsLogin(!isLogin); setMessage({ text: '', type: '' }); }}
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
