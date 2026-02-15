import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import { User, Phone, Mail, MapPin, Heart, Cross, Briefcase, Plus, Trash2, CheckCircle, Upload, Calendar, ArrowRight, Home, Users, BookOpen, PenTool } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

const Section = ({ title, icon: Icon, children, className }) => (
    <motion.div
        variants={itemVariants}
        className={clsx(
            "bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 hover:shadow-md transition-shadow duration-300",
            className
        )}
    >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {children}
        </div>
    </motion.div>
);

const Input = ({ label, register, required, type = "text", error, fullWidth = false, icon: Icon, placeholder }) => (
    <div className={clsx("space-y-2", fullWidth && "md:col-span-2")}>
        <label className="text-sm font-semibold text-gray-700 ml-1 block">
            {label} {required && <span className="text-pink-500">*</span>}
        </label>
        <div className="relative group">
            <input
                type={type}
                placeholder={placeholder}
                {...register}
                className={clsx(
                    "w-full px-4 py-3 pl-4 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white placeholder-gray-400",
                    Icon ? "pl-11" : "",
                    error
                        ? "border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-pink-900 placeholder-pink-300"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 hover:border-gray-300"
                )}
            />
            {Icon && (
                <Icon className={clsx(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    error ? "text-pink-400" : "text-gray-400 group-focus-within:text-blue-500"
                )} size={18} />
            )}
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-pink-500 font-medium ml-1"
            >
                {error.message}
            </motion.p>
        )}
    </div>
);

const Select = ({ label, register, options, required, error, icon: Icon }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 ml-1 block">
            {label} {required && <span className="text-pink-500">*</span>}
        </label>
        <div className="relative group">
            <select
                {...register}
                className={clsx(
                    "w-full px-4 py-3 pl-4 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white appearance-none cursor-pointer",
                    Icon ? "pl-11" : "",
                    error
                        ? "border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-pink-900"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 hover:border-gray-300"
                )}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {Icon && (
                <Icon className={clsx(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    error ? "text-pink-400" : "text-gray-400 group-focus-within:text-blue-500"
                )} size={18} />
            )}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-pink-500 font-medium ml-1"
            >
                {error.message}
            </motion.p>
        )}
    </div>
);

const TextArea = ({ label, register, required, error, fullWidth = false, placeholder }) => (
    <div className={clsx("space-y-2", fullWidth && "md:col-span-2")}>
        <label className="text-sm font-semibold text-gray-700 ml-1 block">
            {label} {required && <span className="text-pink-500">*</span>}
        </label>
        <div className="relative group">
            <textarea
                rows={3}
                placeholder={placeholder}
                {...register}
                className={clsx(
                    "w-full px-4 py-3 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white placeholder-gray-400 resize-none",
                    error
                        ? "border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-pink-900 placeholder-pink-300"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 hover:border-gray-300"
                )}
            />
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-pink-500 font-medium ml-1"
            >
                {error.message}
            </motion.p>
        )}
    </div>
);


const Register = () => {
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            member_type: 'NEW',
            children: []
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "children"
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const passportPhoto = watch("passport_photo");
    const maritalStatus = watch("marital_status");
    const isSaved = watch("saved");
    const isBaptized = watch("baptized");

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const jsonData = { ...data };
            delete jsonData.passport_photo;

            // Format checkboxes if needed (though boolean works fine usually)

            const res = await api.post('members/', jsonData);

            if (data.passport_photo && data.passport_photo[0]) {
                const photoData = new FormData();
                photoData.append('passport_photo', data.passport_photo[0]);
                await api.patch(`members/${res.data.id}/`, photoData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setSuccess(true);
        } catch (error) {
            console.error("Registration error", error);
            // Handle validation errors from backend
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Registration failed. Please check your inputs.";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center space-y-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                    >
                        <CheckCircle size={48} strokeWidth={2.5} />
                    </motion.div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Registration Complete!</h2>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            Welcome to the family! Your details have been successfully submitted to the COC administration.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl w-full flex items-center justify-center gap-2 group"
                    >
                        Register Another Member
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto space-y-8"
            >
                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800 pb-2">
                        Member Registration
                    </h1>
                    <p className="text-gray-500 text-lg font-medium tracking-wide">Join the COC Family - The Blessed Place</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Membership Type */}
                    <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex justify-center">
                        <div className="flex items-center gap-6 bg-gray-50 p-2 rounded-xl border border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-white transition-all">
                                <input type="radio" value="NEW" {...register("member_type")} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                                <span className="font-semibold text-gray-700">New Member</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-white transition-all">
                                <input type="radio" value="OLD" {...register("member_type")} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                                <span className="font-semibold text-gray-700">Old Member</span>
                            </label>
                        </div>
                    </motion.div>

                    {/* Section 1: Personal Details */}
                    <Section title="Personal Details" icon={User}>
                        <Input label="Full Name" register={register("full_name", { required: "Full name is required" })} required error={errors.full_name} icon={User} />
                        <Input label="Also Known As" register={register("also_known_as")} placeholder="Nickname / Alias" icon={User} />

                        <Input label="Phone Number" register={register("phone", { required: "Phone is required" })} required error={errors.phone} icon={Phone} />
                        <Input label="Email Address" type="email" register={register("email")} error={errors.email} icon={Mail} />

                        <Input label="Year of Birth" type="number" register={register("year_of_birth")} error={errors.year_of_birth} icon={Calendar} />
                        <Input label="National ID Number" register={register("national_id")} placeholder="ID Number / Passport No" error={errors.national_id} icon={User} />
                        <Select
                            label="Gender"
                            register={register("gender")}
                            options={[
                                { value: "MALE", label: "Male" },
                                { value: "FEMALE", label: "Female" }
                            ]}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1 block">Passport Photo</label>
                            <label className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 bg-gray-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group h-[52px] relative overflow-hidden">
                                <div className="flex items-center gap-3 text-gray-500 group-hover:text-blue-600">
                                    <Upload size={20} />
                                    <span className="text-sm font-medium truncate max-w-[200px]">
                                        {passportPhoto && passportPhoto[0] ? passportPhoto[0].name : "Click to upload photo"}
                                    </span>
                                </div>
                                <input type="file" {...register("passport_photo")} className="hidden" accept="image/*" />
                            </label>
                        </div>

                        <TextArea label="Other Details" register={register("other_details")} placeholder="Any other relevant information..." fullWidth />
                    </Section>

                    {/* Section 2: Residence & Living Arrangement */}
                    <Section title="Residence & Accommodation" icon={Home}>
                        <Input label="Residential Estate" register={register("estate")} error={errors.estate} icon={MapPin} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Phase" register={register("phase")} />
                            <Input label="Plot No" register={register("plot")} />
                        </div>
                        <Input label="House / Door No" register={register("door")} error={errors.door} />
                        <Input label="Village" register={register("village")} error={errors.village} />

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
                        <p className="md:col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Living Arrangement</p>

                        <Input label="Whom do you stay with?" register={register("staying_with")} placeholder="e.g. Parents, Spouse, Friends" icon={Users} />
                        <Input label="Relationship" register={register("staying_with_relation")} placeholder="e.g. Father, Wife, Roommate" />

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
                        <p className="md:col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Home Origin</p>

                        <Input label="Home County" register={register("county")} error={errors.county} icon={MapPin} />
                        <Input label="Sub County" register={register("sub_county")} />
                        <Input label="Location / Ward" register={register("ward")} fullWidth />
                    </Section>

                    {/* Section 3: Education & Occupation */}
                    <Section title="Education & Occupation" icon={Briefcase}>
                        <Input label="Education Level" register={register("education_level")} placeholder="e.g. University, High School" icon={BookOpen} />
                        <Input label="Courses Pursued" register={register("education_course")} placeholder="e.g. Computer Science" />

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

                        <Input label="Work Place" register={register("work_place")} icon={Briefcase} />
                        <Input label="Type of Work (Occupation)" register={register("occupation")} />
                        <Input label="Area of Work" register={register("work_area")} placeholder="e.g. Thika Town" fullWidth />
                    </Section>

                    {/* Section 4: Family Details */}
                    <Section title="Family Details" icon={Heart}>
                        <div className="md:col-span-2">
                            <Select
                                label="Marital Status"
                                register={register("marital_status")}
                                options={[
                                    { value: "SINGLE", label: "Single" },
                                    { value: "MARRIED", label: "Married" },
                                    { value: "WIDOWED", label: "Widowed" },
                                    { value: "DIVORCED", label: "Divorced" }
                                ]}
                            />
                        </div>

                        {/* Conditional Spouse Fields */}
                        <AnimatePresence>
                            {maritalStatus === 'MARRIED' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-pink-50/50 p-6 rounded-xl border border-pink-100"
                                >
                                    <Input label="Spouse Name" register={register("spouse_name")} icon={User} />
                                    <Input label="Spouse Phone" register={register("spouse_phone")} icon={Phone} />
                                    <Input label="Spouse Workplace" register={register("spouse_workplace")} icon={Briefcase} />
                                    <Input label="Spouse Occupation" register={register("spouse_occupation")} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
                        <p className="md:col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Parents</p>

                        <Input label="Father's Name" register={register("father_name")} icon={User} />
                        <Input label="Mother's Name" register={register("mother_name")} icon={User} />

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
                        <p className="md:col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Next of Kin</p>

                        <Input label="Next of Kin Name" register={register("next_of_kin_name")} icon={User} />
                        <Input label="Relationship" register={register("next_of_kin_relation")} />
                        <Input label="Contact Number" register={register("next_of_kin_phone")} icon={Phone} fullWidth />
                    </Section>

                    {/* Section 5: Children */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                    <Users size={20} />
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">Children</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => append({ full_name: "", date_of_birth: "", school_or_work: "" })}
                                className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-95 duration-200"
                            >
                                <Plus size={16} /> Add Child
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <AnimatePresence>
                                {fields.map((field, index) => (
                                    <motion.div
                                        key={field.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-gray-50/80 rounded-xl relative group border border-gray-100"
                                    >
                                        <div className="md:col-span-4">
                                            <Input label="Child Name" register={register(`children.${index}.full_name`)} required fullWidth={false} />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Input label="Date of Birth" type="date" register={register(`children.${index}.date_of_birth`)} fullWidth={false} />
                                        </div>
                                        <div className="md:col-span-4">
                                            <Input label="School / Work / Course" register={register(`children.${index}.school_or_work`)} fullWidth={false} placeholder="Place of School/Work" />
                                        </div>
                                        <div className="md:col-span-1 flex items-end justify-center pb-1">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                                title="Remove Child"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {fields.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl"
                                >
                                    <p className="text-gray-400 mb-2">No children added yet.</p>
                                    <p className="text-sm text-gray-400">Click the button above to add family members.</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Section 6: Spiritual Details */}
                    <Section title="Spiritual Details" icon={Cross}>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-4">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative">
                                    <input type="checkbox" {...register("saved")} className="peer sr-only" />
                                    <div className="w-6 h-6 border-2 border-gray-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                        <CheckCircle size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-gray-700 font-semibold group-hover:text-blue-700 transition-colors">Are you born again?</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative">
                                    <input type="checkbox" {...register("baptized")} className="peer sr-only" />
                                    <div className="w-6 h-6 border-2 border-gray-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                        <CheckCircle size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-gray-700 font-semibold group-hover:text-blue-700 transition-colors">Are you baptized?</span>
                            </label>
                        </div>

                        {/* Conditional Spiritual Fields */}
                        <AnimatePresence>
                            {isSaved && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 grid md:grid-cols-2 gap-6 mb-4">
                                    <Input label="When were you saved?" type="date" register={register("saved_date")} />
                                    <Input label="Where were you saved?" register={register("saved_where")} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

                        <Input label="Previous Church" register={register("previous_church")} icon={Home} />
                        <Input label="Previous Ministry" register={register("previous_ministry")} placeholder="What ministry did you do?" />

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

                        <Input label="Desired Ministry" register={register("desired_ministry")} placeholder="Where do you desire to serve?" fullWidth />
                        <Input label="Date Joined This Church" type="date" register={register("joined_date")} icon={Calendar} />

                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

                        <TextArea label="What influenced you to come to this church?" register={register("influence_reason")} fullWidth />
                        <TextArea label="Prayer Needs" register={register("prayer_need")} placeholder="Any specific prayer needs?" fullWidth />
                    </Section>

                    {/* Member Role & Pledge Section (Static for now, maybe legal checkbox later) */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-sm text-gray-600 space-y-4 border border-gray-200">
                        <h4 className="font-bold text-gray-800 uppercase tracking-wide">Role of a Member</h4>
                        <p>
                            Includes attending services, seminars, home/church fellowships, mid-week services, overnight meetings, conferences, retreats, crusades, and other ministry functions organized by CHRISTIAN OUTREACH CENTRE - THE BLESSED PLACE.
                            As a member you are expected to give tithe (10%) faithfully and give your offering in proportion of how God blesses you, live a life of prayer and show genuine love for other members, live a holy live and constantly support the church to grow stronger.
                        </p>

                        <h4 className="font-bold text-gray-800 uppercase tracking-wide mt-4">Pledge</h4>
                        <p className="italic mb-4">
                            "I pledge to be a loyal member, pray and honor our Bishop, our Reverends, Our Pastors, and all leaders in the church. I will support this work of God faithfully with prayers, my tithes (10%), offerings and my personal participation in all functions organized by the church, So help me God."
                        </p>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Name</label>
                                    <input
                                        {...register("signature_name", { required: "Signature Name is required" })}
                                        className="w-full font-medium text-gray-900 border-b-2 border-gray-300 pb-1 outline-none focus:border-blue-600 bg-transparent"
                                        placeholder="Type your full name"
                                    />
                                    {errors.signature_name && <p className="text-xs text-red-500 mt-1">{errors.signature_name.message}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">ID No</label>
                                    <input
                                        {...register("signature_id", { required: "Signature ID is required" })}
                                        className="w-full font-medium text-gray-900 border-b-2 border-gray-300 pb-1 outline-none focus:border-blue-600 bg-transparent"
                                        placeholder="Type your ID number"
                                    />
                                    {errors.signature_id && <p className="text-xs text-red-500 mt-1">{errors.signature_id.message}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Date</label>
                                    <div className="font-medium text-gray-900 border-b-2 border-gray-300 pb-1">{new Date().toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        {...register("pledge_agreed", { required: "You must agree to the pledge" })}
                                        className="peer sr-only"
                                        id="pledge_agree"
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-400 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                        <CheckCircle size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <label htmlFor="pledge_agree" className="font-semibold text-gray-800 cursor-pointer select-none">
                                    I have read and agree to the Roles and Pledge above.
                                </label>
                            </div>
                            {errors.pledge_agreed && <p className="text-xs text-red-500 ml-8">{errors.pledge_agreed.message}</p>}
                        </div>
                    </div>

                    <motion.div variants={itemVariants} className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={clsx(
                                "w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none mb-12 flex items-center justify-center gap-2",
                            )}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Registration"
                            )}
                        </button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
