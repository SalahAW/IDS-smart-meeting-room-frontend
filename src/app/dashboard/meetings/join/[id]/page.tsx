"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, ArrowLeft, VideoOff, MicOff, Settings, Sparkles, Users, User, X, Calendar, Clock, CheckSquare, ExternalLink } from 'lucide-react';
import { DefaultButton } from "@/app/dashboard/components/DefaultButton";

// --- CUSTOM HOOK ---
const useClientParams = () => {
    const [params, setParams] = useState({ id: '' });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const id = pathSegments[pathSegments.length - 1];
            setParams({ id });
        }
    }, []);
    return params;
};

// --- MOCK DATA (UPDATED) ---
const allMeetings = {
    '1': { id: 1, title: "Project Phoenix Kick-off", date: "August 25, 2025", time: "02:00 PM", host: "Jane Smith", participants: ["JS", "AD", "MB", "CW", "EG", "AB", "CD"], description: "Initial kick-off for the new Project Phoenix. We will discuss project goals, timeline, and assign initial tasks.", todos: ["Review project brief", "Prepare introduction slides", "Finalize agenda"] },
    '2': { id: 2, title: "Marketing Sync-up", date: "August 27, 2025", time: "11:00 AM", host: "John Doe", participants: ["MC", "LK", "JD"], description: "Weekly sync-up to review campaign performance and plan for the upcoming week.", todos: ["Analyze last week's metrics", "Present new ad creatives"] },
    '3': { id: 3, title: "Q3 Planning Session", date: "August 29, 2025", time: "09:30 AM", host: "Jane Smith", participants: ["ET", "JS", "AD", "MC"], description: "A detailed planning session to finalize the roadmap and budget for the third quarter.", todos: ["Prepare budget proposal", "Outline key initiatives"] },
    '4': { id: 4, title: "Engineering Meeting", date: "September 1, 2025", time: "11:00 AM", host: "John Doe", participants: ["JD", "SR", "MK"], description: "Weekly engineering meeting to discuss project progress and address any issues.", todos: ["Prepare project updates", "Discuss new feature development"] },
    '5': { id: 5, title: "Sales Meeting", date: "September 3, 2025", time: "09:30 AM", host: "Jane Smith", participants: ["JS", "BL", "CR"], description: "Weekly sales meeting to discuss new leads and progress on ongoing deals.", todos: ["Prepare sales reports", "Discuss new lead follow-up"] },
    '6': { id: 6, title: "Design Review", date: "September 5, 2025", time: "02:00 PM", host: "John Doe", participants: ["JD", "EG", "SS"], description: "Design review meeting to discuss new design concepts and provide feedback.", todos: ["Prepare design concepts", "Gather feedback"] },
    '7': { id: 7, title: "Customer Meeting", date: "September 7, 2025", time: "11:00 AM", host: "Jane Smith", participants: ["JS", "PO"], description: "Meeting with a potential customer to discuss product features and pricing.", todos: ["Review customer brief", "Prepare demo"] },
    '8': { id: 8, title: "All Hands Meeting", date: "September 10, 2025", time: "11:00 AM", host: "Jane Smith", participants: ["ET", "JS", "AD", "MC", "LK", "MB", "CW", "EG"], description: "All-hands meeting to discuss company news and progress on ongoing initiatives.", todos: ["Prepare company updates", "Finalize agenda"] },
};

const getMeetingDetails = (id) => allMeetings[id] || null;

// --- Meeting Details Modal ---
const MeetingDetailsModal = ({ meeting, onClose }) => {
    const roomImages = [
        "https://placehold.co/600x400/E2E8F0/475569?text=Conference+Room",
        "https://placehold.co/600x400/CBD5E1/475569?text=Whiteboard+Area",
        "https://placehold.co/600x400/94A3B8/FFFFFF?text=AV+Equipment",
    ];
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % roomImages.length);
        }, 2500);
        return () => clearInterval(timer);
    }, [roomImages.length]);

    if (!meeting) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex items-start justify-between bg-white border-b border-slate-200 flex-shrink-0">
                    <div><h2 className="text-2xl font-bold text-slate-800">{meeting.title}</h2><p className="text-sm text-slate-500">Hosted by {meeting.host}</p></div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-3">
                        <div className="relative h-72 w-full rounded-xl overflow-hidden mb-4 group">
                            {roomImages.map((src, i) => (<motion.img key={src} src={src} alt={`Room view ${i + 1}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: i === currentImage ? 1 : 0, scale: i === currentImage ? 1 : 1.05 }} transition={{ duration: 0.7, ease: 'easeInOut' }} className="absolute inset-0 w-full h-full object-cover" />))}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">{roomImages.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentImage ? 'bg-white scale-125' : 'bg-white/50'}`}></div>))}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Calendar size={16} className="mr-3 text-slate-400"/> {meeting.date}</div>
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.time}</div>
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg col-span-2"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants.length} Participants</div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">{meeting.description}</p>
                        <h3 className="font-semibold text-slate-700 mb-3">Action Items</h3>
                        <ul className="space-y-2">
                            {meeting.todos.map((todo, i) => (<li key={i} className="flex items-center text-sm text-slate-700 bg-slate-100 p-3 rounded-lg"><CheckSquare size={16} className="mr-3 text-blue-600 flex-shrink-0"/><span>{todo}</span></li>))}
                        </ul>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


// --- MAIN JOIN MEETING PAGE COMPONENT ---
const JoinMeetingPage = () => {
    const params = useClientParams();
    const videoRef = useRef(null);
    const [meeting, setMeeting] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const meetingId = params.id;

    useEffect(() => {
        if (meetingId) {
            const details = getMeetingDetails(meetingId);
            setMeeting(details);
            setIsLoading(false);
        }

        const enableStream = async () => {
            if (!isCameraOn) {
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject;
                    stream.getTracks().forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) { videoRef.current.srcObject = stream; }
            } catch (err) { console.error(err); setIsCameraOn(false); }
        };
        enableStream().then(r => {});

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [meetingId, isCameraOn]);

    if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
    if (!meeting) return <div className="flex items-center justify-center h-full">Meeting not found.</div>;

    return (
        <>
            <AnimatePresence>
                {isModalOpen && <MeetingDetailsModal meeting={meeting} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>

            <div className="w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-6 sm:p-10"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Video Preview and Controls */}
                        <div className="flex flex-col">
                            <div className="relative w-full aspect-video bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
                                {isCameraOn ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                                        <User size={64} className="mb-4 text-slate-400" />
                                        <p className="font-semibold">Your camera is off</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <DefaultButton variant={isMicOn ? 'secondary' : 'destructive'} size="lg" onClick={() => setIsMicOn(!isMicOn)}>
                                    {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
                                </DefaultButton>
                                <DefaultButton variant={isCameraOn ? 'secondary' : 'destructive'} size="lg" onClick={() => setIsCameraOn(!isCameraOn)}>
                                    {isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}
                                </DefaultButton>
                                <DefaultButton variant="secondary" size="lg"><Sparkles size={22} /></DefaultButton>
                                <DefaultButton variant="secondary" size="lg"><Settings size={22} /></DefaultButton>
                            </div>
                            {/* MOVED: Device selection is now here */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Microphone</label>
                                    <select className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                        <option>Default - Built-in Microphone</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Camera</label>
                                    <select className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                        <option>Default - FaceTime HD Camera</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Meeting Details */}
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 flex flex-col">
                            <p className="font-semibold text-slate-500 mb-2">Ready to join?</p>
                            <h1 className="text-4xl font-bold text-slate-800">{meeting.title}</h1>
                            <p className="text-slate-500 mt-2 text-lg">{meeting.date} at {meeting.time}</p>

                            <div className="border-t border-slate-200 my-6"></div>

                            <div className="flex items-center mb-6">
                                <Users size={20} className="text-slate-400 mr-4" />
                                <h3 className="font-semibold text-slate-700">{meeting.participants.length} Participants</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 mb-6">
                                {meeting.participants.map((p, i) => (
                                    <div key={i} className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-lg">
                                        {p}
                                    </div>
                                ))}
                            </div>

                            {/* REMOVED: Device selection was here */}

                            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-200">
                                <DefaultButton size="lg" className="w-full text-lg">
                                    Join Meeting Now
                                </DefaultButton>
                                <DefaultButton variant="outline" size="lg" className="w-full text-lg" onClick={() => setIsModalOpen(true)}>
                                    <ExternalLink size={18} className="mr-2" />
                                    View Details
                                </DefaultButton>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default JoinMeetingPage;