import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/auth';
export default function Login() {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await login(username, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4", children: _jsxs("form", { onSubmit: submit, className: "w-full max-w-sm bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold", children: "Sign in" }), _jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Sem5 BI Platform" })] }), _jsxs("label", { className: "flex flex-col gap-1 text-sm", children: ["Username", _jsx("input", { value: username, onChange: (e) => setUsername(e.target.value), className: "bg-neutral-800 rounded px-3 py-2", autoComplete: "username" })] }), _jsxs("label", { className: "flex flex-col gap-1 text-sm", children: ["Password", _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "bg-neutral-800 rounded px-3 py-2", autoComplete: "current-password" })] }), error && _jsx("div", { className: "text-sm text-red-400", children: error }), _jsx("button", { type: "submit", disabled: busy, className: "w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-2 text-sm font-medium", children: busy ? 'Signing in…' : 'Sign in' }), _jsxs("p", { className: "text-xs text-neutral-500", children: ["Two roles: ", _jsx("span", { className: "text-neutral-300", children: "admin" }), " (business intelligence + platform administration) and", ' ', _jsx("span", { className: "text-neutral-300", children: "analyst" }), " (business intelligence)."] })] }) }));
}
