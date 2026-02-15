import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, UserPlus, Droplets, Church, TrendingUp, ArrowRight, Activity, Calendar, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const StatCard = ({ title, value, icon: Icon, color, trend, gradient }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ y: -2, shadow: "0 4px 20px -5px rgba(0,0,0,0.05)" }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group min-h-[160px] md:h-40"
    >
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-xl -mr-8 -mt-8 group-hover:opacity-10 transition-opacity duration-500`}></div>

        <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start z-10 h-full">
            <div className="text-center md:text-left">
                <p className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider uppercase">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>

                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-2 py-0.5 rounded-md w-fit mx-auto md:mx-0">
                        <TrendingUp size={12} strokeWidth={2.5} />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ring-4 ring-white mt-3 md:mt-0`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
    </motion.div>
);

const ActivityItem = ({ title, time, type }) => (
    <div className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-gray-100">
        <div className={clsx(
            "mt-1 w-2 h-2 rounded-full flex-shrink-0",
            type === 'registration' ? "bg-blue-500" :
                type === 'ministry' ? "bg-purple-500" : "bg-gray-400"
        )} />
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{title}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{time}</p>
        </div>
        <button className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100">
            <ArrowRight size={14} />
        </button>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_members: 0,
        new_members: 0,
        baptized_members: 0,
        active_ministries: 0,
        activities: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('dashboard-stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time overview of the church growth and activities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Members"
                    value={stats.total_members}
                    icon={Users}
                    color="blue"
                    gradient="from-blue-500 to-indigo-600"
                    trend="+12% growth"
                />
                <StatCard
                    title="New Members"
                    value={stats.new_members}
                    icon={UserPlus}
                    color="emerald"
                    gradient="from-emerald-400 to-green-600"
                    trend="+5 this month"
                />
                <StatCard
                    title="Baptized"
                    value={stats.baptized_members}
                    icon={Droplets}
                    color="cyan"
                    gradient="from-cyan-400 to-blue-500"
                />
                <StatCard
                    title="Ministries"
                    value={stats.active_ministries}
                    icon={Church}
                    color="purple"
                    gradient="from-purple-500 to-pink-600"
                    trend="Stable"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area - e.g., Charts */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col min-h-[350px]">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            Church Growth Analytics
                        </h3>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <div className="flex-1 min-h-[250px] w-full mt-2">
                        {stats.growth_data && stats.growth_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.growth_data}>
                                    <defs>
                                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide={true}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1E293B',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                        labelStyle={{ display: 'none' }}
                                        cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="members"
                                        stroke="#4F46E5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorMembers)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 mb-1 group-hover:scale-110 transition-transform duration-300">
                                    <Activity size={24} />
                                </div>
                                <p className="font-bold text-sm text-gray-700">Growth Chart Visualization</p>
                                <p className="text-[10px] text-gray-400">Data will appear here once analytics are configured</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                    <h3 className="font-bold text-base text-gray-900 mb-5">Recent Activity</h3>
                    <div className="space-y-1">
                        {stats.activities && stats.activities.length > 0 ? (
                            stats.activities.map((activity) => (
                                <ActivityItem
                                    key={activity.id}
                                    title={activity.title}
                                    time={new Date(activity.timestamp).toLocaleDateString() + ' ' + new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    type={activity.type}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-xs text-gray-400 italic">No recent activities found</p>
                            </div>
                        )}
                    </div>
                    <button className="mt-auto pt-5 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 justify-center w-full group">
                        View All Activity
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

        </motion.div>
    );
};

export default Dashboard;
