import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Church, Users, Plus, Search, MoreHorizontal, ArrowRight, User, MapPin, Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import AddMinistryModal from './AddMinistryModal';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Ministries = () => {
    const [ministries, setMinistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ministryToDelete, setMinistryToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    const fetchMinistries = async () => {
        setLoading(true);
        try {
            const res = await api.get('ministries/');
            setMinistries(res.data);
        } catch (error) {
            console.error("Error fetching ministries", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMinistry = async () => {
        if (!ministryToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`ministries/${ministryToDelete.id}/`);
            setMinistries(prev => prev.filter(m => m.id !== ministryToDelete.id));
            setMinistryToDelete(null);
        } catch (error) {
            console.error("Error deleting ministry", error);
            alert("Failed to delete ministry. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchMinistries();
    }, []);

    const filteredMinistries = ministries.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-10"
        >
            {/* Header Section */}
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left justify-between gap-6 bg-white p-8 lg:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ministries & Departments</h1>
                    <p className="text-slate-500 text-base font-medium mt-2">Oversee organizational structures, leadership, and community reach.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="relative z-10 w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={20} strokeWidth={3} />
                    Create Ministry
                </button>
            </div>

            {/* Intelligence Filter */}
            <div className="bg-white p-3 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-3 max-w-2xl mx-auto md:mx-0">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search departments or leaders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 border border-transparent focus:border-indigo-100 transition-all text-sm font-bold text-slate-700 placeholder-slate-400"
                    />
                </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                <AnimatePresence mode="popLayout">
                    {filteredMinistries.map(ministry => (
                        <motion.div
                            key={ministry.id}
                            variants={itemVariants}
                            layout
                            className="group bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:border-indigo-200/60 hover:-translate-y-2 relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -mr-12 -mt-12 transition-colors duration-500 group-hover:bg-indigo-100/50" />

                            <div className="p-8 lg:p-10 relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-200 transition-all duration-500">
                                        <Church size={28} />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenuId(activeMenuId === ministry.id ? null : ministry.id)}
                                            className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {activeMenuId === ministry.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-20"
                                                        onClick={() => setActiveMenuId(null)}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30"
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                setMinistryToDelete(ministry);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete Ministry
                                                        </button>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{ministry.name}</h3>
                                <p className="text-slate-500 text-sm font-medium mt-3 line-clamp-2 h-10 leading-relaxed">
                                    {ministry.description || "Leading and growing the church through dedicated service and community engagement."}
                                </p>

                                <div className="mt-10 space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <User size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Leader Assignment</p>
                                            <p className="text-sm font-black text-slate-800 truncate">{ministry.leader_name || "Unassigned Unit"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <Users size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Registered Force</p>
                                            <p className="text-sm font-black text-slate-800 truncate">{ministry.member_count || 0} Members Engaged</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto px-8 lg:px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group-hover:bg-white transition-colors">
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 group/btn active:scale-95">
                                    Analyze Dept
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter opacity-70">Log: {new Date(ministry.created_at).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredMinistries.length === 0 && !loading && (
                    <div className="col-span-full py-32 bg-white rounded-[40px] border border-dashed border-slate-200 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Church size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Units Deployed</h3>
                        <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto">Establish your first ministry or department to begin church operations.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-10 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
                        >
                            Initialize System
                        </button>
                    </div>
                )}
            </div>

            <AddMinistryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchMinistries}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {ministryToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !deleting && setMinistryToDelete(null)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={40} className="text-rose-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">Delete Ministry?</h3>
                                <p className="text-sm text-slate-500 font-medium mb-8">
                                    You are about to delete the <span className="font-bold text-slate-900">{ministryToDelete.name}</span>. This will affect all assigned members. This action is irreversible.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        disabled={deleting}
                                        onClick={handleDeleteMinistry}
                                        className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 hover:bg-rose-700 transition active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {deleting ? 'Removing Ministry...' : 'Yes, Delete Unit'}
                                    </button>
                                    <button
                                        disabled={deleting}
                                        onClick={() => setMinistryToDelete(null)}
                                        className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Ministries;

