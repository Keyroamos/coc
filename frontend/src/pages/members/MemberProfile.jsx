import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    User, Phone, Mail, MapPin, Calendar, Heart, Cross,
    Briefcase, ArrowLeft, Edit, Printer, Loader,
    Clock, Shield, Home, Church, Trash2, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import AddMemberModal from './AddMemberModal';

const MemberProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [ministries, setMinistries] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Function to refetch member data after edit
    const fetchMember = async () => {
        try {
            const response = await api.get(`members/${id}/`);
            setMember(response.data);
        } catch (error) {
            console.error("Error fetching member:", error);
        }
    };

    const fetchMinistries = async () => {
        try {
            const response = await api.get('ministries/');
            setMinistries(response.data);
        } catch (error) {
            console.error("Error fetching ministries:", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                await Promise.all([
                    fetchMember(),
                    fetchMinistries()
                ]);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const handleAssignMinistry = async (ministryId) => {
        setAssigning(true);
        try {
            await api.patch(`members/${id}/`, { main_ministry: ministryId });
            await fetchMember();
            setIsAssignModalOpen(false);
        } catch (error) {
            console.error("Error assigning ministry:", error);
            alert("Failed to assign unit. Please try again.");
        } finally {
            setAssigning(false);
        }
    };

    const handleDeleteMember = async () => {
        setDeleting(true);
        try {
            await api.delete(`members/${id}/`);
            navigate('/members');
        } catch (error) {
            console.error("Error deleting member:", error);
            alert("Failed to delete member. Please try again.");
        } finally {
            setDeleting(false);
        }
    };


    if (!member) return <div className="text-center py-20 text-gray-500">Member not found</div>;

    const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const tabs = [
        { id: 'personal', label: 'Overview', icon: User },
        { id: 'residence', label: 'Residence', icon: MapPin },
        { id: 'family', label: 'Family', icon: Heart },
        { id: 'spiritual', label: 'Spiritual & Pledge', icon: Cross },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/members')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Directory
                </button>
                <div className="flex gap-3">
                    <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                        <Printer size={20} />
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm shadow-sm"
                    >
                        <Edit size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            <AddMemberModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    fetchMember();
                    setIsEditModalOpen(false);
                }}
                initialData={member}
            />

            <AssignUnitModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onAssign={handleAssignMinistry}
                ministries={ministries}
                currentMinistryId={member.main_ministry}
                loading={assigning}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar - Profile Card */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
                        {/* Decorative Background */}
                        <div className="h-24 bg-slate-900 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                        </div>

                        <div className="px-6 pb-6 text-center relative">
                            <div className="relative inline-block -mt-12 mb-4">
                                {member.passport_photo ? (
                                    <img
                                        src={member.passport_photo}
                                        alt={member.full_name}
                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center border-4 border-white shadow-lg">
                                        <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-xl font-bold">
                                            {getInitials(member.full_name)}
                                        </div>
                                    </div>
                                )}
                                <div className={clsx(
                                    "absolute -bottom-1 -right-1 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border-2 border-white shadow-sm",
                                    member.member_type === 'NEW' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                                )}>
                                    {member.member_type === 'NEW' ? 'New Member' : 'Member'}
                                </div>
                            </div>

                            <h1 className="text-lg font-bold text-slate-900 leading-tight">{member.full_name}</h1>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1 italic">{member.member_id}</p>

                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                {member.saved && (
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100 flex items-center gap-1">
                                        <Cross size={10} strokeWidth={3} /> REBORN
                                    </span>
                                )}
                                <span className={clsx(
                                    "px-3 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1",
                                    member.gender === 'MALE' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-rose-50 text-rose-600 border-rose-100'
                                )}>
                                    {member.gender === 'MALE' ? 'MALE' : 'FEMALE'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-600 transition-all active:scale-95 group/call">
                                    <Phone size={14} className="group-hover:-rotate-12 transition-transform" /> CALL
                                </a>
                                <a
                                    href={member.email ? `mailto:${member.email}` : '#'}
                                    className={clsx(
                                        "flex items-center justify-center gap-2 h-10 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95",
                                        !member.email
                                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                    )}
                                >
                                    <Mail size={14} /> MAIL
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Ministry Status Card */}
                    <div className="bg-[#0f172a] rounded-3xl shadow-lg p-6 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12" />

                        <h3 className="font-bold text-white/50 text-[10px] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Shield size={12} className="text-indigo-400" />
                            Force Assignment
                        </h3>

                        <div className="space-y-3">
                            {member.main_ministry_name ? (
                                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 group/min hover:border-indigo-500/30 transition-colors">
                                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Active Unit</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">{member.main_ministry_name}</p>
                                            <button
                                                onClick={() => setIsAssignModalOpen(true)}
                                                className="text-[9px] text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-wider mt-1 text-left transition-colors"
                                            >
                                                Change Unit
                                            </button>
                                        </div>
                                        <Church size={14} className="text-indigo-400" />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No Active assignment</p>
                                    <button
                                        onClick={() => setIsAssignModalOpen(true)}
                                        className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
                                    >
                                        Assign Unit
                                    </button>
                                </div>
                            )}

                            {member.desired_ministry && (
                                <div className="bg-slate-800/20 rounded-2xl p-4 border border-slate-700/30">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Requested Objective</p>
                                    <p className="font-bold text-[11px] text-slate-300 mt-1 uppercase italic">{member.desired_ministry}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm overflow-x-auto w-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition-all flex-1 justify-center whitespace-nowrap uppercase tracking-wider
                                    ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <tab.icon size={12} className={activeTab === tab.id ? 'text-indigo-400' : ''} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'personal' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <h3 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest border-b border-indigo-100 pb-1">
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Phone Number" value={member.phone} icon={Phone} />
                                            <DetailItem label="Email Address" value={member.email} icon={Mail} />
                                            <DetailItem label="National ID" value={member.national_id} icon={User} />
                                            <DetailItem label="Also Known As" value={member.also_known_as} icon={User} />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <h3 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest border-b border-indigo-100 pb-1">
                                            Bio-Data
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Date of Birth" value={member.year_of_birth} icon={Calendar} />
                                            <DetailItem
                                                label="Age"
                                                value={member.year_of_birth ? `${new Date().getFullYear() - member.year_of_birth} years` : null}
                                                icon={Clock}
                                            />
                                            <DetailItem label="Gender" value={member.gender === 'MALE' ? 'Male' : 'Female'} icon={User} />
                                        </div>
                                        {member.other_details && (
                                            <div className="mt-6 pt-6 border-t border-slate-50 w-full text-center">
                                                <p className="text-[9px] font-bold text-slate-300 mb-3 uppercase tracking-wider">Additional Notes</p>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 italic">
                                                    "{member.other_details}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'residence' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2 mb-6 text-center">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <Home size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Residential Address</h3>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Estate / Area" value={member.estate} />
                                            <DetailItem label="House / Door No" value={member.door} />
                                            <DetailItem label="Phase" value={member.phase} />
                                            <DetailItem label="Plot Number" value={member.plot} />
                                            <DetailItem label="Village" value={member.village} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2 mb-6 text-center">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Home Origin</h3>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="County" value={member.county} />
                                            <DetailItem label="Sub-County" value={member.sub_county} />
                                            <DetailItem label="Ward / Location" value={member.ward} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2 mb-6 text-center">
                                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                                <Briefcase size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Occupation</h3>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Work Place" value={member.work_place} />
                                            <DetailItem label="Occupation" value={member.occupation} />
                                            <DetailItem label="Area of Work" value={member.work_area} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'family' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <div className="flex flex-col items-center justify-between mb-8 w-full text-center">
                                            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Family Structure</h3>
                                            <span className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                                Status: {member.marital_status || 'Empty'}
                                            </span>
                                        </div>

                                        {member.marital_status === 'MARRIED' && (
                                            <div className="bg-rose-50/30 rounded-2xl p-6 border border-rose-100 mb-8 w-full max-w-xl text-center flex flex-col items-center">
                                                <h4 className="font-bold text-rose-900/50 mb-6 flex items-center gap-2 uppercase text-[9px] tracking-widest"><Heart size={12} className="fill-current" /> Spouse Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                                    <DetailItem label="Spouse Name" value={member.spouse_name} />
                                                    <DetailItem label="Spouse Phone" value={member.spouse_phone} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Next of Kin" value={member.next_of_kin_name} />
                                            <DetailItem label="Relationship" value={member.next_of_kin_relation} />
                                            <DetailItem label="Kin Contact" value={member.next_of_kin_phone} />
                                        </div>

                                        <div className="border-t border-slate-100 my-8 w-full max-w-xl"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Father's Name" value={member.father_name} />
                                            <DetailItem label="Mother's Name" value={member.mother_name} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                                        <h3 className="text-[10px] font-bold text-slate-900 mb-8 uppercase tracking-widest">Children</h3>
                                        {member.children && member.children.length > 0 ? (
                                            <div className="space-y-3 w-full max-w-xl">
                                                {member.children.map((child, idx) => (
                                                    <div key={child.id || idx} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{child.full_name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">{child.date_of_birth || 'No Date'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 sm:mt-0 px-3 py-1 text-[9px] font-bold text-indigo-500 bg-white rounded-lg border border-indigo-50 uppercase tracking-wider">
                                                            {child.school_or_work || 'None'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-300 font-bold uppercase tracking-widest text-[9px]">
                                                No children recorded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'spiritual' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2 mb-8 text-center">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
                                                <Cross size={20} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Spiritual Profile</h3>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                                            <StatusBadge label="REBORN" active={member.saved} />
                                            <StatusBadge label="BAPTIZED" active={member.baptized} />
                                        </div>

                                        {member.saved && (
                                            <div className="bg-indigo-50/20 rounded-2xl p-6 border border-indigo-50 grid md:grid-cols-2 gap-8 mb-10 w-full max-w-xl">
                                                <DetailItem label="Date Reborn" value={member.saved_date} icon={Calendar} />
                                                <DetailItem label="Sanctuary" value={member.saved_where} icon={MapPin} />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full max-w-xl">
                                            <DetailItem label="Previous Church" value={member.previous_church} />
                                            <DetailItem label="Previous Ministry" value={member.previous_ministry} />
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-100 w-full text-center">
                                            <p className="text-[9px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Motivation</p>
                                            <p className="text-slate-600 text-xs italic font-medium tracking-tight">
                                                "{member.influence_reason || 'NO RECORD'}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pledge Section Placeholder */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2 mb-6 text-center">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
                                                <Heart size={20} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Pledges & Contributions</h3>
                                            </div>
                                        </div>

                                        <div className="w-full max-w-xl text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                                No financial pledges recorded for this member.<br />
                                                <span className="text-indigo-500 cursor-pointer hover:underline">Click to Record New Pledge</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !deleting && setIsDeleteModalOpen(false)}
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
                                    You are about to delete <span className="font-bold text-slate-900">{member.full_name}</span>. This action is irreversible.
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
                                        onClick={() => setIsDeleteModalOpen(false)}
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

// Components
const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col items-center text-center">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 leading-none">
            {Icon && <Icon size={12} strokeWidth={3} className="text-indigo-500/50" />} {label}
        </p>
        <p className="text-[13px] font-semibold text-slate-800 tracking-tight leading-none">{value || <span className="text-slate-400 font-normal italic">None</span>}</p>
    </div>
);

const StatusBadge = ({ label, active }) => (
    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {label}
        </div>
    </div>
);

const AssignUnitModal = ({ isOpen, onClose, onAssign, ministries, currentMinistryId, loading }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-none">Assign Unit</h3>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Select a deployment unit for this member.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                <ArrowLeft size={18} className="rotate-90 md:rotate-0" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {ministries.map((ministry) => (
                                <button
                                    key={ministry.id}
                                    disabled={loading}
                                    onClick={() => onAssign(ministry.id)}
                                    className={clsx(
                                        "w-full p-4 rounded-2xl border text-left flex items-center justify-between group transition-all",
                                        currentMinistryId === ministry.id
                                            ? "border-indigo-600 bg-indigo-50/50"
                                            : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            currentMinistryId === ministry.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                        )}>
                                            <Church size={18} />
                                        </div>
                                        <div>
                                            <p className={clsx("text-sm font-bold", currentMinistryId === ministry.id ? "text-indigo-900" : "text-slate-700")}>
                                                {ministry.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                Active Unit
                                            </p>
                                        </div>
                                    </div>
                                    {currentMinistryId === ministry.id && (
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                            <Heart size={12} className="fill-current" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {ministries.length === 0 && (
                            <div className="py-12 text-center">
                                <Shield size={40} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Units Available</p>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50">
                            <div className="flex flex-col items-center gap-4">
                                <Loader className="animate-spin text-indigo-600" size={32} />
                                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Deploying...</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MemberProfile;

