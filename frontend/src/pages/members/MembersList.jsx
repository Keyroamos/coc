import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Plus, Filter, Phone, MapPin, User, Grid, List as ListIcon, MoreVertical, Mail, ChevronRight, Trash2, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import AddMemberModal from './AddMemberModal';

const MembersList = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, NEW, OLD
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        let result = members;

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(member =>
                member.full_name.toLowerCase().includes(lowerTerm) ||
                member.member_id.toLowerCase().includes(lowerTerm) ||
                member.phone.includes(searchTerm)
            );
        }

        // Type Filter
        if (filterType !== 'ALL') {
            result = result.filter(member => member.member_type === filterType);
        }

        setFilteredMembers(result);
    }, [searchTerm, filterType, members]);

    const fetchMembers = async () => {
        try {
            const response = await api.get('members/');
            setMembers(response.data);
            setFilteredMembers(response.data);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async () => {
        if (!memberToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`members/${memberToDelete.id}/`);
            setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
            setMemberToDelete(null);
        } catch (error) {
            console.error("Error deleting member:", error);
            alert("Failed to delete member. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };


    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center md:flex-row md:items-end md:text-left justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Members Directory</h1>
                    <p className="text-gray-500 mt-1.5 text-base">Manage, track, and connect with your church community.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full md:w-auto justify-center flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 active:scale-95 duration-200 text-sm"
                >
                    <Plus size={20} />
                    Add New Member
                </button>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or phone number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400 font-medium text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto p-1 md:p-0">
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        {['ALL', 'NEW', 'OLD'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === type
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {type === 'ALL' ? 'All' : type === 'NEW' ? 'New' : 'Old'}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ListIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {filteredMembers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No members found</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                        We couldn't find any members matching your search. Try adjusting terms or add a new member.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setFilterType('ALL'); }}
                        className="mt-6 text-blue-600 font-bold hover:underline text-sm"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
                    <AnimatePresence mode="popLayout">
                        {filteredMembers.map((member) => (
                            <motion.div
                                key={member.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={clsx(
                                    "group bg-white border border-slate-200/60 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-indigo-200/60 hover:-translate-y-1 relative overflow-hidden",
                                    viewMode === 'grid'
                                        ? 'rounded-[32px] p-6 lg:p-8 flex flex-col'
                                        : 'rounded-2xl p-4 flex items-center gap-6'
                                )}
                            >
                                {/* Decorative Gradient (Grid View Only) */}
                                {viewMode === 'grid' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -mr-8 -mt-8 -z-10 group-hover:bg-indigo-100/50 transition-colors duration-500" />
                                )}

                                {/* Card Header */}
                                <div className={clsx("flex items-start justify-between", viewMode === 'list' && 'flex-1')}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {member.passport_photo ? (
                                                <img
                                                    src={member.passport_photo}
                                                    alt={member.full_name}
                                                    className={clsx(
                                                        "rounded-2xl object-cover shadow-sm ring-4 ring-white transition-transform duration-500 group-hover:scale-105",
                                                        viewMode === 'grid' ? 'w-16 h-16' : 'w-12 h-12'
                                                    )}
                                                />
                                            ) : (
                                                <div className={clsx(
                                                    "rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 ring-4 ring-white",
                                                    viewMode === 'grid' ? 'w-16 h-16 text-lg' : 'w-12 h-12 text-sm'
                                                )}>
                                                    {getInitials(member.full_name)}
                                                </div>
                                            )}
                                            <div className={clsx(
                                                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                                                member.member_type === 'NEW' ? 'bg-emerald-500' : 'bg-indigo-500'
                                            )} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                                {member.full_name}
                                            </h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                {member.member_id}
                                            </p>
                                        </div>
                                    </div>

                                    {viewMode === 'grid' && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                                                className="p-2 text-slate-300 hover:text-slate-600 transition-colors hover:bg-slate-50 rounded-xl"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {activeMenuId === member.id && (
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
                                                                    setMemberToDelete(member);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete Member
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className={clsx(viewMode === 'grid' ? 'mt-8 space-y-4' : 'flex items-center gap-8')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors duration-300">
                                            <Phone size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{member.phone}</span>
                                    </div>

                                    {(member.estate || member.county) && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors duration-300">
                                                <MapPin size={16} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 truncate">
                                                {[member.estate, member.county].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className={clsx(
                                    viewMode === 'grid'
                                        ? 'mt-8 pt-6 border-t border-slate-100 flex items-center justify-between'
                                        : 'flex items-center gap-6 ml-auto'
                                )}>
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                            member.member_type === 'NEW'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                        )}>
                                            {member.member_type === 'NEW' ? 'New Life' : 'Core Member'}
                                        </span>
                                    </div>

                                    {viewMode === 'grid' ? (
                                        <Link
                                            to={`/members/${member.id}`}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95 flex items-center gap-2 group/btn"
                                        >
                                            View Details
                                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <Link
                                            to={`/members/${member.id}`}
                                            className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                                        >
                                            <ChevronRight size={20} />
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchMembers();
                    setIsAddModalOpen(false);
                }}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {memberToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !deleting && setMemberToDelete(null)}
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
                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">Delete Member?</h3>
                                <p className="text-sm text-slate-500 font-medium mb-8">
                                    You are about to delete <span className="font-bold text-slate-900">{memberToDelete.full_name}</span>. This action is irreversible.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        disabled={deleting}
                                        onClick={handleDeleteMember}
                                        className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 hover:bg-rose-700 transition active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {deleting ? 'Removing Member...' : 'Yes, Delete Member'}
                                    </button>
                                    <button
                                        disabled={deleting}
                                        onClick={() => setMemberToDelete(null)}
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
        </div>
    );
};

export default MembersList;
