import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { Church, Users, X, CheckCircle, Info, User } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const AddMinistryModal = ({ isOpen, onClose, onRefresh }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                try {
                    const res = await api.get('accounts/users/'); // Assuming this endpoint exists
                    setUsers(res.data);
                } catch (error) {
                    console.error("Error fetching users", error);
                }
            };
            // fetchUsers(); // Uncomment if/when users endpoint is available
        }
    }, [isOpen]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await api.post('ministries/', data);
            reset();
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error creating ministry", error);
            alert("Failed to create ministry. Please check your inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Church size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Ministry</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Initialize Department</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Ministry Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Info size={18} />
                                    </div>
                                    <input
                                        {...register('name', { required: 'Name is required' })}
                                        placeholder="e.g. Worship Team"
                                        className={clsx(
                                            "w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300",
                                            "focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5",
                                            errors.name && "border-rose-500 bg-rose-50"
                                        )}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    {...register('description')}
                                    placeholder="Describe the mission and scope of this ministry..."
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                                />
                            </div>

                            {/* Leader Selection - Placeholder for now */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Leader</label>
                                <div className="relative group opacity-50 cursor-not-allowed">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <select
                                        disabled
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none"
                                    >
                                        <option>Select a leader (Backend restricted)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (
                                        <>
                                            Save Ministry
                                            <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddMinistryModal;
