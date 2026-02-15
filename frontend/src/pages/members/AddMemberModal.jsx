import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import { User, Phone, Mail, MapPin, Heart, Cross, Briefcase, Plus, Trash2, CheckCircle, Upload, Calendar, ArrowRight, Home, Users, BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

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
                    "w-full py-2.5 pr-4 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white placeholder-gray-400 focus:shadow-sm text-sm",
                    Icon ? "pl-10" : "pl-4",
                    error
                        ? "border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-pink-900 placeholder-pink-300"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 hover:border-gray-300"
                )}
            />
            {Icon && (
                <Icon className={clsx(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    error ? "text-pink-400" : "text-gray-400 group-focus-within:text-blue-500"
                )} size={16} />
            )}
        </div>
        {error && <p className="text-xs text-pink-500 font-medium ml-1">{error.message}</p>}
    </div>
);

const Select = ({ label, register, options, required, error, icon: Icon, fullWidth = false }) => (
    <div className={clsx("space-y-2", fullWidth && "md:col-span-2")}>
        <label className="text-sm font-semibold text-gray-700 ml-1 block">
            {label} {required && <span className="text-pink-500">*</span>}
        </label>
        <div className="relative group">
            <select
                {...register}
                className={clsx(
                    "w-full py-2.5 pr-10 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white appearance-none cursor-pointer focus:shadow-sm text-sm",
                    Icon ? "pl-10" : "pl-4",
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
                )} size={16} />
            )}
            <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={16} />
        </div>
        {error && <p className="text-xs text-pink-500 font-medium ml-1">{error.message}</p>}
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
                    "w-full px-4 py-3 border rounded-xl outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white placeholder-gray-400 resize-none focus:shadow-sm",
                    error
                        ? "border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-pink-900 placeholder-pink-300"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 hover:border-gray-300"
                )}
            />
        </div>
        {error && <p className="text-xs text-pink-500 font-medium ml-1">{error.message}</p>}
    </div>
);

const AddMemberModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const isEditing = !!initialData;
    const { register, control, handleSubmit, watch, trigger, formState: { errors }, reset } = useForm({
        defaultValues: { member_type: 'NEW', children: [] }
    });
    const { fields, append, remove } = useFieldArray({ control, name: "children" });
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [ministryOptions, setMinistryOptions] = useState([]);

    // Fetch ministries for dropdown
    React.useEffect(() => {
        const fetchMinistries = async () => {
            try {
                const res = await api.get('ministries/');
                setMinistryOptions(res.data);
            } catch (error) {
                console.error("Error fetching ministries", error);
            }
        };
        if (isOpen) {
            fetchMinistries();
        }
    }, [isOpen]);

    // Reset form when opening or changing mode
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Transform initialData to match form fields
                reset({
                    ...initialData,
                    // Restore DOB from year_of_birth if dob is missing
                    dob: initialData.year_of_birth ? `${initialData.year_of_birth}-01-01` : '',
                    children: initialData.children || [],
                    // For existing members, we assume they've already pledged
                    pledge_agreed: true,
                    signature_name: initialData.full_name,
                    signature_id: initialData.national_id || ''
                });
            } else {
                reset({ member_type: 'NEW', children: [] });
            }
            setStep(1);
        }
    }, [isOpen, initialData, reset]);
    const maritalStatus = watch("marital_status");
    const isSaved = watch("saved");
    const passportPhoto = watch("passport_photo");

    const steps = [
        { id: 1, title: 'Personal Info', icon: User },
        { id: 2, title: 'Residence & Work', icon: Home },
        { id: 3, title: 'Family', icon: Heart },
        { id: 4, title: 'Spiritual & Pledge', icon: Cross },
    ];

    const nextStep = async () => {
        let fieldsToValidate = [];
        if (step === 1) fieldsToValidate = ['full_name', 'phone', 'member_type']; // Add basic validation fields
        // In a real app, I'd list all required fields per step.
        // For prototype, I'll trigger validation on the fields I know are required.

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(Math.min(step + 1, 4));
    };

    const prevStep = () => setStep(Math.max(step - 1, 1));

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const jsonData = { ...data };
            delete jsonData.passport_photo;

            // Extract Year of Birth from DOB
            if (jsonData.dob) {
                const year = new Date(jsonData.dob).getFullYear();
                if (!isNaN(year)) {
                    jsonData.year_of_birth = year;
                }
            }
            delete jsonData.dob;

            // Remove form-only and read-only fields
            delete jsonData.signature_name;
            delete jsonData.signature_id;
            delete jsonData.pledge_agreed;
            delete jsonData.member_id;
            delete jsonData.id;
            delete jsonData.created_at;
            delete jsonData.updated_at;
            delete jsonData.ministries;
            delete jsonData.main_ministry;

            // Clean empty strings for all fields (convert "" to null) to avoid validation/unique errors
            Object.keys(jsonData).forEach(key => {
                if (jsonData[key] === "") {
                    jsonData[key] = null;
                }
            });

            // Clean children data
            if (jsonData.children && jsonData.children.length > 0) {
                jsonData.children = jsonData.children.map(child => {
                    const cleanChild = { ...child };
                    Object.keys(cleanChild).forEach(key => {
                        if (cleanChild[key] === "") {
                            cleanChild[key] = null;
                        }
                    });
                    return cleanChild;
                });
            } else {
                delete jsonData.children;
            }

            let res;
            if (isEditing) {
                // For edit, use PATCH or PUT
                res = await api.patch(`members/${initialData.id}/`, jsonData);
            } else {
                res = await api.post('members/', jsonData);
            }

            if (data.passport_photo && data.passport_photo[0]) {
                const photoData = new FormData();
                photoData.append('passport_photo', data.passport_photo[0]);
                await api.patch(`members/${res.data.id}/`, photoData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Registration error", error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : `${isEditing ? 'Update' : 'Registration'} failed.`;
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Profile' : 'Add New Member'}</h2>
                        <p className="text-sm text-gray-500">{isEditing ? 'Update member details below.' : 'Fill in the details to register a new member.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Steps Horizontal Navigation */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-max">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center">
                                <button
                                    onClick={() => setStep(s.id)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                        step === s.id ? "bg-blue-600 text-white shadow-md shadow-blue-200" :
                                            step > s.id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"
                                    )}
                                >
                                    <s.icon size={16} />
                                    {s.title}
                                </button>
                                {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 mx-2" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-300">
                    <form id="member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="flex justify-center mb-6">
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <label className={clsx("px-6 py-2 rounded-lg cursor-pointer transition-all font-medium text-sm", watch("member_type") === 'NEW' ? "bg-white shadow-sm text-blue-600" : "text-gray-500")}>
                                            <input type="radio" value="NEW" {...register("member_type")} className="hidden" />
                                            New Member
                                        </label>
                                        <label className={clsx("px-6 py-2 rounded-lg cursor-pointer transition-all font-medium text-sm", watch("member_type") === 'OLD' ? "bg-white shadow-sm text-blue-600" : "text-gray-500")}>
                                            <input type="radio" value="OLD" {...register("member_type")} className="hidden" />
                                            Old Member
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Full Name" register={register("full_name", { required: "Full name is required" })} required error={errors.full_name} icon={User} />
                                    <Input label="Also Known As" register={register("also_known_as")} icon={User} />
                                    <Input label="Phone Number" register={register("phone", { required: "Phone is required" })} required error={errors.phone} icon={Phone} />
                                    <Input label="Email Address" type="email" register={register("email")} icon={Mail} />
                                    <Input label="Date of Birth" type="date" register={register("dob")} icon={Calendar} />
                                    <Input label="National ID Number" register={register("national_id")} icon={User} />
                                    <Select label="Gender" register={register("gender")} options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }]} />

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1 block">Passport Photo</label>
                                        <label className="border border-dashed border-gray-300 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors h-[46px] overflow-hidden">
                                            <Upload size={18} className="text-gray-400" />
                                            <span className="text-sm text-gray-500 truncate">
                                                {passportPhoto && passportPhoto[0] instanceof File
                                                    ? passportPhoto[0].name
                                                    : (typeof passportPhoto === 'string' ? "Change Photo" : "Upload Photo")}
                                            </span>
                                            <input type="file" {...register("passport_photo")} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                    <TextArea label="Other Details" register={register("other_details")} fullWidth />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Residence & Work */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-blue-500" /> Residence</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Residential Estate" register={register("estate")} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Phase" register={register("phase")} />
                                            <Input label="Plot No" register={register("plot")} />
                                        </div>
                                        <Input label="House / Door No" register={register("door")} />
                                        <Input label="Village" register={register("village")} />
                                        <Input label="Home County" register={register("county")} />
                                        <Input label="Sub County" register={register("sub_county")} />
                                        <Input label="Location / Ward" register={register("ward")} />
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-purple-500" /> Occupation & Education</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Education Level" register={register("education_level")} icon={BookOpen} />
                                        <Input label="Courses Pursued" register={register("education_course")} />
                                        <Input label="Work Place" register={register("work_place")} />
                                        <Input label="Occupation" register={register("occupation")} />
                                        <Input label="Area of Work" register={register("work_area")} fullWidth />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Family */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Select label="Marital Status" register={register("marital_status")} options={[{ value: "SINGLE", label: "Single" }, { value: "MARRIED", label: "Married" }, { value: "WIDOWED", label: "Widowed" }, { value: "DIVORCED", label: "Divorced" }]} />
                                    </div>
                                    {maritalStatus === 'MARRIED' && (
                                        <div className="md:col-span-2 grid md:grid-cols-2 gap-6 bg-pink-50/50 p-6 rounded-xl border border-pink-100">
                                            <Input label="Spouse Name" register={register("spouse_name")} icon={User} />
                                            <Input label="Spouse Phone" register={register("spouse_phone")} icon={Phone} />
                                            <Input label="Spouse Workplace" register={register("spouse_workplace")} />
                                            <Input label="Spouse Occupation" register={register("spouse_occupation")} />
                                        </div>
                                    )}
                                    <Input label="Father's Name" register={register("father_name")} icon={User} />
                                    <Input label="Mother's Name" register={register("mother_name")} icon={User} />
                                    <Input label="Next of Kin Name" register={register("next_of_kin_name")} icon={User} />
                                    <Input label="Kin Relationship" register={register("next_of_kin_relation")} />
                                    <Input label="Kin Contact" register={register("next_of_kin_phone")} icon={Phone} fullWidth />
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-800">Children</h4>
                                        <button type="button" onClick={() => append({ full_name: "", date_of_birth: "", school_or_work: "" })} className="text-sm bg-white border border-gray-200 text-blue-600 px-3 py-1.5 rounded-lg font-medium shadow-sm hover:bg-gray-50">
                                            <Plus size={16} className="inline mr-1" /> Add Child
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm relative">
                                                <div className="col-span-12 md:col-span-4"><Input placeholder="Name" register={register(`children.${index}.full_name`)} /></div>
                                                <div className="col-span-12 md:col-span-3"><Input type="date" register={register(`children.${index}.date_of_birth`)} /></div>
                                                <div className="col-span-10 md:col-span-4"><Input placeholder="School/Work" register={register(`children.${index}.school_or_work`)} /></div>
                                                <div className="col-span-2 md:col-span-1 flex items-center justify-center"><button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></div>
                                            </div>
                                        ))}
                                        {fields.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No children added.</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Spiritual & Pledge */}
                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 grid md:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" {...register("saved")} className="w-5 h-5 text-blue-600 rounded" /> <span className="font-medium text-gray-700">Born Again?</span></label>
                                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" {...register("baptized")} className="w-5 h-5 text-blue-600 rounded" /> <span className="font-medium text-gray-700">Baptized?</span></label>
                                </div>

                                {isSaved && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input label="Date Saved" type="date" register={register("saved_date")} />
                                        <Input label="Where Saved" register={register("saved_where")} />
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input label="Previous Church" register={register("previous_church")} />
                                    <Input label="Previous Ministry" register={register("previous_ministry")} />
                                    <Select
                                        label="Desired Ministry"
                                        register={register("desired_ministry")}
                                        options={[
                                            { value: "", label: "Select Ministry" },
                                            ...ministryOptions.map(m => ({ value: m.name, label: m.name }))
                                        ]}
                                        fullWidth
                                    />
                                    <TextArea label="Influence/Reason" register={register("influence_reason")} fullWidth />
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm space-y-3">
                                    <h4 className="font-bold text-gray-900 uppercase">Pledge Agreement</h4>
                                    <p className="text-gray-600 italic">"I pledge to be a loyal member..."</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Sign Name</label>
                                            <input {...register("signature_name", { required: "Required" })} className="w-full border-b border-gray-300 text-sm pb-1 outline-none" placeholder="Full Name" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Sign ID</label>
                                            <input {...register("signature_id", { required: "Required" })} className="w-full border-b border-gray-300 text-sm pb-1 outline-none" placeholder="ID Number" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                            <div className="text-sm text-gray-900 pb-1">{new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                                        <input type="checkbox" {...register("pledge_agreed", { required: true })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="font-bold text-gray-800">I agree to the pledge.</span>
                                    </label>
                                    {errors.pledge_agreed && <p className="text-xs text-red-500 font-bold">You must agree to proceed.</p>}
                                </div>
                            </motion.div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between sticky bottom-0 z-20">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            form="member-form"
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-xl transition disabled:opacity-70"
                        >
                            {submitting ? 'Processing...' : (isEditing ? 'Update Profile' : 'Complete Registration')} <CheckCircle size={18} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AddMemberModal;
