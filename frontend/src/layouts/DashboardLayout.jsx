import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import {
    LayoutDashboard, Users, UserPlus, LogOut, Church,
    CalendarCheck2, Menu, X, Bell, Search, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, path, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            onClick={onClick}
            className={clsx(
                "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive
                    ? "bg-indigo-600/10 text-indigo-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium"
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="activePill"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                />
            )}
            <Icon
                size={20}
                className={clsx(
                    "transition-all duration-300",
                    isActive ? "text-indigo-400 scale-110" : "text-slate-500 group-hover:text-slate-300"
                )}
            />
            <span className="text-sm tracking-wide">{label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
            )}
        </Link>
    );
};

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const res = await api.get(`global-search/?q=${searchTerm}`);
                    setResults(res.data);
                } catch (error) {
                    console.error("Search error", error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const handleClick = () => setShowResults(false);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    if (!user) return null;

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                className={clsx(
                    "fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] flex flex-col transform transition-transform duration-300 ease-out md:translate-x-0 border-r border-slate-800",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            BP
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-lg text-white tracking-tight">BLP SYSTEM</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">The Blessed Place</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mt-4 px-6 space-y-8 scrollbar-none">
                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Discovery</p>
                        <div className="space-y-1">
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
                            <SidebarItem icon={Users} label="Members List" path="/members" />
                        </div>
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Operational</p>
                        <div className="space-y-1">
                            <SidebarItem icon={Church} label="Ministries" path="/ministries" />
                            <SidebarItem icon={CalendarCheck2} label="Attendance" path="/attendance" />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0f172a]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.username}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role || 'Admin Account'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full h-11 flex items-center justify-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-300 font-bold text-sm group"
                    >
                        <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span>Security Logoff</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
                {/* Top Header */}
                <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30 px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 bg-slate-100/50 px-4 py-2 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all border border-transparent focus-within:border-indigo-200 w-96 relative" onClick={(e) => e.stopPropagation()}>
                            <Search size={18} className={clsx("transition-colors", isSearching ? "text-indigo-500 animate-pulse" : "text-slate-400")} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length > 1 && setShowResults(true)}
                                className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400 text-slate-700 font-medium"
                            />

                            <AnimatePresence>
                                {showResults && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 py-2"
                                    >
                                        <div className="px-4 py-2 mb-1 border-b border-slate-50 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                {isSearching ? 'Searching...' : 'Intelligence Search'}
                                            </span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto scrollbar-none">
                                            {results.length > 0 ? (
                                                results.map((item) => (
                                                    <button
                                                        key={`${item.type}-${item.id}`}
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            setSearchTerm('');
                                                            setShowResults(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50/50 transition-colors flex items-center gap-3 group"
                                                    >
                                                        <div className={clsx(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                                                            item.type === 'member' ? "bg-indigo-100 text-indigo-600" : "bg-purple-100 text-purple-600"
                                                        )}>
                                                            {item.type === 'member' ? <Users size={16} /> : <Church size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700">{item.title}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.subtitle}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : !isSearching && (
                                                <div className="px-5 py-8 text-center">
                                                    <p className="text-sm text-slate-400 italic">No intelligence findings for "{searchTerm}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all group">
                            <Bell size={22} />
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-white"></span>
                        </button>
                        <div className="hidden md:block w-px h-8 bg-slate-200/60"></div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-800">
                                    {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-300">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
