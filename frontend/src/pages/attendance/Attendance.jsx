import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
    Calendar, Users, CheckCircle2, Search, Plus, ArrowRight,
    Clock, UserCheck, Sparkles, LayoutGrid, List, UserPlus,
    ChevronRight, MapPin, Phone, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

const Attendance = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('events'); // 'events' or 'record'
    const [layout, setLayout] = useState('list'); // 'grid' or 'list'
    const [activeTab, setActiveTab] = useState('members'); // 'members' or 'visitors'
    const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventLoading, setEventLoading] = useState(false);

    // Event Form State
    const [newEventData, setNewEventData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        is_service: true,
        description: ''
    });

    // Visitor Form State
    const [visitorData, setVisitorData] = useState({
        full_name: '',
        phone_number: '',
        residence: ''
    });

    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [eventsRes, membersRes] = await Promise.all([
                api.get('events/'),
                api.get('members/')
            ]);
            setEvents(eventsRes.data);
            setMembers(membersRes.data);
        } catch (error) {
            console.error("Error fetching attendance data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceAndVisitors = async (eventId) => {
        try {
            const [attRes, visRes] = await Promise.all([
                api.get(`attendance/?event=${eventId}`),
                api.get(`visitors/?event=${eventId}`)
            ]);

            const map = {};
            attRes.data.forEach(record => {
                map[record.member] = record.status;
            });
            setAttendanceMap(map);
            setVisitors(visRes.data);
        } catch (error) {
            console.error("Error fetching event details", error);
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        fetchAttendanceAndVisitors(event.id);
        setView('record');
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    const startSundayService = async () => {
        setLoading(true);
        try {
            const res = await api.get('events/today/');
            handleSelectEvent(res.data);
        } catch (error) {
            console.error("Error starting Sunday service", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = async (memberId) => {
        const currentStatus = attendanceMap[memberId];
        const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';

        setAttendanceMap(prev => ({ ...prev, [memberId]: newStatus }));

        try {
            await api.post('attendance/toggle/', {
                event: selectedEvent.id,
                member: memberId
            });
        } catch (error) {
            console.error("Error toggling attendance", error);
            setAttendanceMap(prev => ({ ...prev, [memberId]: currentStatus }));
        }
    };

    const handleAddVisitor = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('visitors/', {
                ...visitorData,
                event: selectedEvent.id
            });
            setVisitors(prev => [...prev, res.data]);
            setVisitorData({ full_name: '', phone_number: '', residence: '' });
            setIsVisitorModalOpen(false);
            setActiveTab('visitors');
        } catch (error) {
            console.error("Error adding visitor", error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setEventLoading(true);
        try {
            // Ensure date has time component if required by backend, 
            // otherwise ISO string from date input is usually fine for DRF DateTimeField
            await api.post('events/', newEventData);
            await fetchInitialData();
            setIsEventModalOpen(false);
            setNewEventData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                is_service: true,
                description: ''
            });
        } catch (error) {
            console.error("Error creating event", error);
            alert("Failed to create event. Please check your data.");
        } finally {
            setEventLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.member_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredVisitors = visitors.filter(v =>
        v.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isTodaySunday = new Date().getDay() === 0;


    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                        <button
                            onClick={() => setView('events')}
                            className={clsx(
                                "text-2xl font-bold tracking-tight transition-colors",
                                view === 'record' ? "text-gray-400 hover:text-gray-600" : "text-gray-900"
                            )}
                        >
                            Attendance Tracking
                        </button>
                        {view === 'record' && (
                            <div className="flex items-center gap-2">
                                <ArrowRight size={18} className="text-gray-300 hidden md:block" />
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">{selectedEvent?.name}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                        {view === 'events'
                            ? "Manage and track attendance for church services and events."
                            : `SIGN-IN SESSION • ${new Date(selectedEvent?.date).toLocaleDateString()}`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {view === 'events' ? (
                        <>
                            {isTodaySunday && (
                                <button
                                    onClick={startSundayService}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Sparkles size={16} />
                                    Start Sunday Sign-In
                                </button>
                            )}
                            <button
                                onClick={() => setIsEventModalOpen(true)}
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition active:scale-95 flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Custom Event
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsVisitorModalOpen(true)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                            >
                                <UserPlus size={16} />
                                Record Visitor
                            </button>
                            <button
                                onClick={() => setView('events')}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition active:scale-95"
                            >
                                End Session
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'events' ? (
                    <motion.div
                        key="events-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {events.length > 0 ? (
                            events.map(event => (
                                <motion.div
                                    key={event.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -2 }}
                                    onClick={() => handleSelectEvent(event)}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer group hover:border-blue-200 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                            {event.is_service ? 'Service' : 'Event'}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{event.name}</h3>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                            <UserCheck size={14} className="text-gray-400" />
                                            {event.attendance_count || 0} Members Present
                                        </div>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between text-xs font-bold text-blue-600 uppercase tracking-widest pt-4 border-t border-gray-50">
                                        Open Register
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-gray-900 font-bold">No Events Scheduled</h3>
                                <p className="text-gray-400 text-xs mt-1">Click the button above to start today's sign-in.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="record-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl w-fit border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={clsx(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                    activeTab === 'members' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Users size={14} />
                                Members
                            </button>
                            <button
                                onClick={() => setActiveTab('visitors')}
                                className={clsx(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                    activeTab === 'visitors' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <UserPlus size={14} />
                                Visitors
                                {visitors.length > 0 && <span className={clsx("ml-1 px-1.5 py-0.5 rounded-full text-[10px]", activeTab === 'visitors' ? "bg-white text-emerald-600" : "bg-gray-100 text-gray-500")}>{visitors.length}</span>}
                            </button>
                        </div>

                        {/* Sign-in Controls */}
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={activeTab === 'members' ? "SEARCH MEMBER NAME OR ID..." : "SEARCH VISITORS..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-sm font-bold text-gray-700 placeholder-gray-300"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                                <button
                                    onClick={() => setLayout('list')}
                                    className={clsx("p-1.5 rounded-lg transition-all", layout === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400")}
                                >
                                    <List size={20} />
                                </button>
                                <button
                                    onClick={() => setLayout('grid')}
                                    className={clsx("p-1.5 rounded-lg transition-all", layout === 'grid' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400")}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                            </div>
                            <div className={clsx(
                                "px-5 py-3 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-lg transition-all",
                                activeTab === 'members' ? "bg-blue-600 shadow-blue-500/20" : "bg-emerald-600 shadow-emerald-500/20"
                            )}>
                                {activeTab === 'members' ? (
                                    <>
                                        <Users size={18} />
                                        {Object.values(attendanceMap).filter(v => v === 'PRESENT').length} PRESENT
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        {visitors.length} RECORDED
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sign-in Sheet */}
                        {activeTab === 'members' ? (
                            layout === 'list' ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                    {filteredMembers.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => toggleAttendance(member.id)}
                                            className={clsx(
                                                "flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-gray-50 group",
                                                attendanceMap[member.id] === 'PRESENT' ? "bg-emerald-50/30" : "bg-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all",
                                                    attendanceMap[member.id] === 'PRESENT' ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    {member.full_name[0]}
                                                </div>
                                                <div>
                                                    <p className={clsx(
                                                        "text-sm font-black tracking-tight",
                                                        attendanceMap[member.id] === 'PRESENT' ? "text-emerald-900" : "text-gray-900"
                                                    )}>
                                                        {member.full_name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{member.member_id}</p>
                                                </div>
                                            </div>
                                            <div className={clsx(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-tighter",
                                                attendanceMap[member.id] === 'PRESENT'
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-gray-100 text-gray-300 group-hover:border-blue-200 group-hover:text-blue-500"
                                            )}>
                                                {attendanceMap[member.id] === 'PRESENT' ? <><CheckCircle2 size={16} /> SIGNED IN</> : "SIGN IN"}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                        <div className="p-20 text-center">
                                            <Search size={40} className="mx-auto text-gray-100 mb-4" />
                                            <p className="text-gray-400 font-bold mb-4">No members found matching "{searchTerm}"</p>
                                            <button
                                                onClick={() => setIsVisitorModalOpen(true)}
                                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95"
                                            >
                                                Add as Visitor instead?
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {filteredMembers.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => toggleAttendance(member.id)}
                                            className={clsx(
                                                "p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-3 relative overflow-hidden group",
                                                attendanceMap[member.id] === 'PRESENT' ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10" : "bg-white border-gray-100 hover:border-blue-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all",
                                                attendanceMap[member.id] === 'PRESENT' ? "bg-emerald-500 text-white scale-110" : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                            )}>{member.full_name[0]}</div>
                                            <div>
                                                <p className={clsx("text-sm font-black", attendanceMap[member.id] === 'PRESENT' ? "text-emerald-900" : "text-gray-900")}>{member.full_name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.member_id}</p>
                                            </div>
                                            <div className={clsx("mt-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", attendanceMap[member.id] === 'PRESENT' ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600")}>
                                                {attendanceMap[member.id] === 'PRESENT' ? "PRESENT" : "MARK AS PRESENT"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* Visitors View */
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                {filteredVisitors.map(visitor => (
                                    <div key={visitor.id} className="flex items-center justify-between p-4 bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                                {visitor.full_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{visitor.full_name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {visitor.phone_number && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <Phone size={10} /> {visitor.phone_number}
                                                        </div>
                                                    )}
                                                    {visitor.residence && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <MapPin size={10} /> {visitor.residence}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-200">
                                            VISITOR
                                        </div>
                                    </div>
                                ))}
                                {filteredVisitors.length === 0 && (
                                    <div className="p-20 text-center">
                                        <UserPlus size={40} className="mx-auto text-gray-100 mb-4" />
                                        <h3 className="text-gray-900 font-bold">No Visitors Recorded</h3>
                                        <p className="text-gray-400 text-xs mt-1 mb-4">You haven't added any visitors to this session yet.</p>
                                        <button
                                            onClick={() => setIsVisitorModalOpen(true)}
                                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
                                        >
                                            Record First Visitor
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visitor Modal */}
            <AnimatePresence>
                {isVisitorModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsVisitorModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-6 bg-emerald-600 text-white">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-black uppercase tracking-tight">Record Visitor</h2>
                                    <button onClick={() => setIsVisitorModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-emerald-50 text-xs">Record details for a non-member attending {selectedEvent?.name}.</p>
                            </div>

                            <form onSubmit={handleAddVisitor} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name (Required)</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            value={visitorData.full_name}
                                            onChange={(e) => setVisitorData({ ...visitorData, full_name: e.target.value })}
                                            placeholder="Enter visitor's full name"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={visitorData.phone_number}
                                            onChange={(e) => setVisitorData({ ...visitorData, phone_number: e.target.value })}
                                            placeholder="Enter phone number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Place of Residence</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={visitorData.residence}
                                            onChange={(e) => setVisitorData({ ...visitorData, residence: e.target.value })}
                                            placeholder="Enter residential area"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition active:scale-[0.98] mt-2"
                                >
                                    Save Visitor Details
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Event Modal */}
            <AnimatePresence>
                {isEventModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEventModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-6 bg-slate-900 text-white">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-black uppercase tracking-tight">Create Custom Event</h2>
                                    <button onClick={() => setIsEventModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-slate-400 text-xs">Define a new church gathering or special service.</p>
                            </div>

                            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Event Name (Required)</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            value={newEventData.name}
                                            onChange={(e) => setNewEventData({ ...newEventData, name: e.target.value })}
                                            placeholder="e.g. Wednesday Youth Night"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                required
                                                type="date"
                                                value={newEventData.date}
                                                onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Type</label>
                                        <select
                                            value={newEventData.is_service ? "true" : "false"}
                                            onChange={(e) => setNewEventData({ ...newEventData, is_service: e.target.value === "true" })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="true">Service</option>
                                            <option value="false">Special Event</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Short Description</label>
                                    <textarea
                                        rows={2}
                                        value={newEventData.description}
                                        onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                                        placeholder="Briefly describe the objective..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-bold resize-none"
                                    />
                                </div>

                                <button
                                    disabled={eventLoading}
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-slate-200 hover:bg-slate-800 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                                >
                                    {eventLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            CREATING...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Initialize Event
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Attendance;

