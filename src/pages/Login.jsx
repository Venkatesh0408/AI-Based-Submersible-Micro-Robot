import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Activity, Cpu, Database } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(window.location.origin + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                setError(`Server returned error (${response.status})`);
                return;
            }
            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                setError('Invalid server response format');
                return;
            }
            const text = await response.text();
            if (!text || text.trim().startsWith("<")) {
                setError('Received HTML instead of JSON');
                return;
            }
            const data = JSON.parse(text);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error', err);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080203] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-[#0f0507] rounded-3xl shadow-2xl overflow-hidden border border-red-500/30"
            >
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-red-950/60 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-red-500/30">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white text-center">
                            Welcome Back
                        </h2>
                        <p className="text-red-300/70 text-sm mt-2 text-center">
                            Please enter your credentials to continue
                        </p>
                    </div>

                    <form className="flex flex-col gap-5" onSubmit={handlePasswordLogin}>
                        {error && (
                            <div className="bg-red-950/80 text-red-400 p-3 rounded-lg text-sm font-medium border border-red-500/50 text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="relative flex items-center">
                            <User className="absolute left-4 z-10 w-5 h-5 text-gray-400 pointer-events-none select-none" />
                            <input 
                                id="username-input"
                                type="text" 
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ paddingLeft: '3.25rem', paddingRight: '1rem' }}
                                className="w-full bg-[#1a080c] border border-red-500/30 rounded-xl h-12 text-white text-base placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all leading-normal"
                                required
                            />
                        </div>

                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 z-10 w-5 h-5 text-gray-400 pointer-events-none select-none" />
                            <input 
                                id="password-input"
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
                                className="w-full bg-[#1a080c] border border-red-500/30 rounded-xl h-12 text-white text-base placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all leading-normal"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 z-10 text-gray-400 hover:text-gray-200 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-1">
                            <label className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="rounded text-red-500 focus:ring-red-500 accent-red-500 w-4 h-4" /> 
                                Remember me
                            </label>
                            <button type="button" className="text-red-400 font-medium hover:text-red-300 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-lg shadow-red-600/30 disabled:opacity-70"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
                
                <div className="bg-[#180609] border-t border-red-500/20 p-4 flex justify-between items-center text-xs text-gray-400 font-medium px-8">
                    <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-green-400" /> Status: Online</div>
                    <div className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-green-400" /> Secure</div>
                    <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-red-400" /> v2.4.1</div>
                </div>
            </motion.div>
        </div>
    );
}
