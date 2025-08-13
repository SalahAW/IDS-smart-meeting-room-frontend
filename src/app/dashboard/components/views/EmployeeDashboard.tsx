"use client";

import {
    DoorOpen,
    FileText,
    Clock,
    PlusCircle,
    Video
} from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import RoomAvailability from '@/app/dashboard/components/RoomAvailability';
import UpcomingMeetings from '@/app/dashboard/components/UpcomingMeetings';
import InfoCard from '@/app/dashboard/components/InfoCard';
import QuickActionButton from '@/app/dashboard/components/QuickActionButton';

export const EmployeeDashboard = () => {
    const infoCards = [
        { icon: Clock, title: "Today's Meetings", value: '3', subtitle: '1 starting soon', delay: 0.1, color: 'blue' },
        { icon: FileText, title: 'Pending Actions', value: '5', subtitle: 'From last week', delay: 0.2, color: 'yellow' },
        { icon: DoorOpen, title: 'Available Rooms', value: '8', subtitle: 'Out of 12 total', delay: 0.3, color: 'green' },
    ];

    return (
        <>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-6 text-slate-900"
            >
                Welcome back, John!
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {infoCards.map(card => <InfoCard key={card.title} {...card} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <a href="/dashboard/schedule">
                        <QuickActionButton icon={PlusCircle} label="Schedule Meeting" delay={0.4}/>
                    </a>
                    <a href="/dashboard/meetings">
                        <QuickActionButton icon={Video} label="Join Now" delay={0.5}/>
                    </a>
                    <a href="/dashboard/minutes">
                        <QuickActionButton icon={FileText} label="View Minutes" delay={0.6}/>
                    </a>
                </div>
                <div className="lg:col-span-2">
                    <UpcomingMeetings />
                </div>
            </div>

            <div className="grid grid-cols-1">
                <RoomAvailability />
            </div>
        </>
    );
};

export default EmployeeDashboard;