import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { createUser, listUsers, updateUserRole } from '@/services/api';
import { getStoredUser } from '@/services/auth';
const ROLE_OPTIONS = ['analyst', 'admin'];
function errorMessage(err, fallback) {
    return err instanceof Error ? err.message.replace('Request failed: ', 'HTTP ') : fallback;
}
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [state, setState] = useState('loading');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('analyst');
    const me = getStoredUser();
    const load = useCallback(() => {
        setState('loading');
        listUsers()
            .then((r) => {
            setUsers(r.users);
            setState('ready');
        })
            .catch((err) => {
            setError(errorMessage(err, 'Could not load users.'));
            setState('error');
        });
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const changeRole = async (username, role) => {
        setError(null);
        setMessage(null);
        try {
            await updateUserRole(username, role);
            setMessage(`${username} is now ${role}.`);
            load();
        }
        catch (err) {
            const detail = err instanceof Error ? err.message : '';
            setError(errorMessage(err, 'Could not change role.') +
                (detail.includes('409') ? ' — the last admin cannot be demoted.' : ''));
            load();
        }
    };
    const create = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        try {
            await createUser(newUsername.trim(), newPassword, newRole);
            setMessage(`Created ${newUsername.trim()} as ${newRole}.`);
            setNewUsername('');
            setNewPassword('');
            setNewRole('analyst');
            load();
        }
        catch (err) {
            setError(errorMessage(err, 'Could not create user.'));
        }
    };
    if (state === 'loading')
        return _jsx("div", { className: "text-neutral-400 text-sm", children: "Loading users\u2026" });
    if (state === 'error')
        return _jsx("div", { className: "text-red-400 text-sm", children: error ?? 'Could not load users.' });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "font-medium", children: "Users" }), _jsxs("span", { className: "text-xs text-neutral-500", children: [users.length, " accounts"] })] }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "text-neutral-500 text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-1", children: "Username" }), _jsx("th", { className: "text-left py-1", children: "Role" }), _jsx("th", { className: "text-right py-1", children: "Change role" })] }) }), _jsx("tbody", { children: users.map((u) => (_jsxs("tr", { className: "border-t border-neutral-800", children: [_jsxs("td", { className: "py-2", children: [u.username, u.username === me?.username && (_jsx("span", { className: "ml-2 text-xs text-neutral-500", children: "you" }))] }), _jsx("td", { className: "py-2 uppercase text-xs", children: _jsx("span", { className: u.role === 'admin' ? 'text-amber-400' : 'text-emerald-400', children: u.role }) }), _jsx("td", { className: "py-2 text-right", children: _jsx("select", { "aria-label": `role for ${u.username}`, value: u.role, onChange: (e) => changeRole(u.username, e.target.value), className: "bg-neutral-800 rounded px-2 py-1 text-sm", children: ROLE_OPTIONS.map((r) => (_jsx("option", { value: r, children: r }, r))) }) })] }, u.username))) })] }), _jsxs("p", { className: "text-xs text-neutral-500 mt-3", children: ["Only two roles exist: ", _jsx("span", { className: "text-neutral-300", children: "admin" }), " (business intelligence + platform administration) and", ' ', _jsx("span", { className: "text-neutral-300", children: "analyst" }), " (business intelligence)."] })] }), _jsxs("form", { onSubmit: create, className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-3", children: [_jsx("h2", { className: "font-medium", children: "Create user" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm", children: [_jsxs("label", { className: "flex flex-col gap-1", children: ["Username", _jsx("input", { value: newUsername, onChange: (e) => setNewUsername(e.target.value), minLength: 3, maxLength: 50, required: true, className: "bg-neutral-800 rounded px-3 py-1.5" })] }), _jsxs("label", { className: "flex flex-col gap-1", children: ["Password", _jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), minLength: 6, maxLength: 128, required: true, className: "bg-neutral-800 rounded px-3 py-1.5" })] }), _jsxs("label", { className: "flex flex-col gap-1", children: ["Role", _jsx("select", { value: newRole, onChange: (e) => setNewRole(e.target.value), className: "bg-neutral-800 rounded px-3 py-1.5", children: ROLE_OPTIONS.map((r) => (_jsx("option", { value: r, children: r }, r))) })] })] }), _jsx("button", { type: "submit", className: "bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 text-sm font-medium", children: "Create" })] }), message && _jsx("div", { className: "text-sm text-emerald-400", children: message }), error && _jsx("div", { className: "text-sm text-red-400", children: error })] }));
}
