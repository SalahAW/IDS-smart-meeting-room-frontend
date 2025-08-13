// Upcoming Meetings List Component
import AnimatedWrapper from "@/app/dashboard/components/AnimatedWrapper";
import { motion } from "framer-motion";
import {DoorOpen, Users, Video} from "lucide-react";


const UpcomingMeetings = () => {
    const meetings = [
        { time: '10:00 AM', title: 'Q3 Strategy Review', room: 'Orion', attendees: 5, isVideo: true },
        { time: '11:30 AM', title: 'Frontend Sync-up', room: 'Cygnus', attendees: 8, isVideo: true },
        { time: '02:00 PM', title: 'Project Phoenix Kick-off', room: 'Pegasus', attendees: 12, isVideo: false },
    ];

    return (
        <AnimatedWrapper delay={0.4}>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 h-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Upcoming Meetings</h3>
                <div className="space-y-4">
                    {meetings.map((meeting, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg overflow-hidden"
                        >
                            <div className="flex items-center">
                                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-md bg-blue-100 text-blue-700 font-bold">
                                    <span className="text-lg">{meeting.time.split(' ')[0]}</span>
                                    <span className="text-xs">{meeting.time.split(' ')[1]}</span>
                                </div>
                                <div className="ml-4">
                                    <p className="font-semibold text-slate-800">{meeting.title}</p>
                                    <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                                        <span className="flex items-center"><DoorOpen size={14} className="mr-1"/>{meeting.room}</span>
                                        <span className="flex items-center"><Users size={14} className="mr-1"/>{meeting.attendees}</span>
                                        {meeting.isVideo && <span className="flex items-center text-blue-500"><Video size={14} className="mr-1"/>Online</span>}
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                Join Now
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AnimatedWrapper>
    );
};

export default UpcomingMeetings;