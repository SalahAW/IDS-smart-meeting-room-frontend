"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, ArrowLeft, VideoOff, MicOff, Settings, Sparkles, Users, User, X, Calendar, Clock, CheckSquare, ExternalLink, AlertTriangle } from 'lucide-react';
import { DefaultButton } from "@/app/dashboard/components/DefaultButton";
import api from '@/lib/api';
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

// --- Type Definitions ---
interface ApiMeetingUser {
    id: number;
    name: string;
}
interface ApiMeeting {
    id: number;
    title: string;
    startTime: string;
    hostName: string;
    users: ApiMeetingUser[];
    agenda: string;
}
interface Meeting {
    id: number;
    title: string;
    date: string;
    time: string;
    host: string;
    participants: string[]; // Initials
    description: string;
    todos: string[]; // Not provided by API
}

// --- Meeting Details Modal (Unchanged) ---
const MeetingDetailsModal = ({ meeting, onClose }: { meeting: Meeting | null, onClose: () => void }) => {
    // This component remains the same
    const roomImages = [ "https://placehold.co/600x400/E2E8F0/475569?text=Conference+Room", "https://placehold.co/600x400/CBD5E1/475569?text=Whiteboard+Area", "https://placehold.co/600x400/94A3B8/FFFFFF?text=AV+Equipment", ];
    const [currentImage, setCurrentImage] = useState(0);
    useEffect(() => { const timer = setInterval(() => { setCurrentImage(prev => (prev + 1) % roomImages.length); }, 2500); return () => clearInterval(timer); }, [roomImages.length]);
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
                        <div className="relative h-72 w-full rounded-xl overflow-hidden mb-4 group">{roomImages.map((src, i) => (<motion.img key={src} src={src} alt={`Room view ${i + 1}`} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: i === currentImage ? 1 : 0, scale: i === currentImage ? 1 : 1.05 }} transition={{ duration: 0.7, ease: 'easeInOut' }} className="absolute inset-0 w-full h-full object-cover" />))}<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">{roomImages.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentImage ? 'bg-white scale-125' : 'bg-white/50'}`}></div>))}</div></div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Calendar size={16} className="mr-3 text-slate-400"/> {meeting.date}</div>
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg"><Clock size={16} className="mr-3 text-slate-400"/> {meeting.time}</div>
                            <div className="flex items-center text-slate-600 bg-slate-100 p-3 rounded-lg col-span-2"><Users size={16} className="mr-3 text-slate-400"/> {meeting.participants.length} Participants</div>
                        </div>
                    </div>
                    <div className="md:col-span-2"><h3 className="font-semibold text-slate-700 mb-2">Description</h3><p className="text-sm text-slate-600 leading-relaxed mb-6">{meeting.description}</p><h3 className="font-semibold text-slate-700 mb-3">Action Items</h3><ul className="space-y-2">{meeting.todos.map((todo, i) => (<li key={i} className="flex items-center text-sm text-slate-700 bg-slate-100 p-3 rounded-lg"><CheckSquare size={16} className="mr-3 text-blue-600 flex-shrink-0"/><span>{todo}</span></li>))}</ul></div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN JOIN MEETING PAGE COMPONENT ---
const JoinMeetingPage = ({ params }: { params: { id: string } }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const meetingId = params.id;

    useEffect(() => {
        if (!meetingId) return;

        const fetchAndInitialize = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch meeting data
                const response = await api.get(`/Meetings/${meetingId}`);
                const apiMeeting: ApiMeeting = response.data.meeting;

                // Transform API data to the format the UI expects
                const transformedMeeting: Meeting = {
                    id: apiMeeting.id,
                    title: apiMeeting.title,
                    date: new Date(apiMeeting.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    time: new Date(apiMeeting.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    host: apiMeeting.hostName,
                    participants: (apiMeeting.users || []).map(u => u.name.split(' ').map(n => n[0]).join('').toUpperCase()),
                    description: apiMeeting.agenda || "No description provided.",
                    todos: [] // API doesn't provide this field
                };
                setMeeting(transformedMeeting);

                // Enable camera/mic stream
                if (isCameraOn) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    if (videoRef.current) { videoRef.current.srcObject = stream; }
                }
            } catch (err) {
                console.error("Failed to join meeting:", err);
                setError("Could not load meeting details. Please check the ID and try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndInitialize();

        return () => { // Cleanup function to stop media tracks when component unmounts
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [meetingId, isCameraOn]); // Rerun if meetingId changes or camera is toggled

    if (isLoading) return <div className="flex h-full w-full items-center justify-center"><ContentSpinner /></div>;
    if (error) return <div className="text-center py-16 bg-red-50 text-red-700 rounded-2xl border border-red-200"><AlertTriangle className="mx-auto h-12 w-12 text-red-400" /><h3 className="mt-4 text-xl font-semibold">An Error Occurred</h3><p className="mt-2">{error}</p></div>;
    if (!meeting) return <div className="flex items-center justify-center h-full">Meeting not found.</div>;

    return (
        <>
            <AnimatePresence>
                {isModalOpen && <MeetingDetailsModal meeting={meeting} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>

            <div className="w-full h-full flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-6 sm:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Video Preview and Controls */}
                        <div className="flex flex-col">
                            <div className="relative w-full aspect-video bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
                                {isCameraOn ? (<video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>) : (<div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100"><User size={64} className="mb-4 text-slate-400" /><p className="font-semibold">Your camera is off</p></div>)}
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <DefaultButton variant={isMicOn ? 'secondary' : 'destructive'} size="lg" onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <Mic size={22} /> : <MicOff size={22} />}</DefaultButton>
                                <DefaultButton variant={isCameraOn ? 'secondary' : 'destructive'} size="lg" onClick={() => setIsCameraOn(!isCameraOn)}>{isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}</DefaultButton>
                                <DefaultButton variant="secondary" size="lg"><Sparkles size={22} /></DefaultButton>
                                <DefaultButton variant="secondary" size="lg"><Settings size={22} /></DefaultButton>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div><label className="text-sm font-medium text-slate-700">Microphone</label><select className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"><option>Default - Built-in Microphone</option></select></div>
                                <div><label className="text-sm font-medium text-slate-700">Camera</label><select className="mt-1 block w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"><option>Default - FaceTime HD Camera</option></select></div>
                            </div>
                        </div>

                        {/* Right Column: Meeting Details */}
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 flex flex-col">
                            <p className="font-semibold text-slate-500 mb-2">Ready to join?</p>
                            <h1 className="text-4xl font-bold text-slate-800">{meeting.title}</h1>
                            <p className="text-slate-500 mt-2 text-lg">{meeting.date} at {meeting.time}</p>
                            <div className="border-t border-slate-200 my-6"></div>
                            <div className="flex items-center mb-6"><Users size={20} className="text-slate-400 mr-4" /><h3 className="font-semibold text-slate-700">{meeting.participants.length} Participants</h3></div>
                            <div className="flex flex-wrap gap-4 mb-6">
                                {meeting.participants.map((p, i) => (<div key={i} className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-lg">{p}</div>))}
                            </div>
                            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-200">
                                <DefaultButton size="lg" className="w-full text-lg">Join Meeting Now</DefaultButton>
                                <DefaultButton variant="outline" size="lg" className="w-full text-lg" onClick={() => setIsModalOpen(true)}><ExternalLink size={18} className="mr-2" />View Details</DefaultButton>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default JoinMeetingPage;