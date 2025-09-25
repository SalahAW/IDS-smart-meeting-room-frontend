"use client";

import { motion } from "framer-motion";
import {
    DoorOpen,
    FileText,
    Clock,
    PlusCircle,
    Video,
    Users,
    MapPin,
    Calendar,
    CheckCircle,
    AlertCircle,
    Building
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from "next-auth/react";
import api from '@/lib/api';
import { DefaultButton } from "@/app/dashboard/components/DefaultButton";
import ContentSpinner from '@/app/dashboard/components/ContentLoadingSpinner';

// Data Types
interface Meeting {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    roomId: number;
    roomName?: string;
    organizerId: number;
    organizerName?: string;
    status: string;
    attendeesCount?: number;
}

interface Room {
    id: number;
    name: string;
    capacity: number;
    location?: string;
    status?: string;
    currentMeeting?: Meeting;
}

interface ActionItem {
    id: number;
    description: string;
    dueDate: string;
    status: string;
    meetingTitle: string;
    meetingId: number;
}

interface EmployeeStats {
    todaysMeetings: number;
    pendingActions: number;
    availableRooms: number;
    totalRooms: number;
}

// --- REUSABLE COMPONENTS ---
const AnimatedWrapper = ({ children, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
        {children}
    </motion.div>
);

const InfoCard = ({ icon: Icon, title, value, subtitle, delay, color, isLoading }) => (
    <AnimatedWrapper delay={delay}>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    {isLoading ? (
                        <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
            </div>
            {subtitle && !isLoading && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </div>
    </AnimatedWrapper>
);

const QuickActionButton = ({ icon: Icon, label, delay, href }) => (
    <AnimatedWrapper delay={delay}>
        <a href={href} className="block">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {label}
                    </span>
                </div>
            </div>
        </a>
    </AnimatedWrapper>
);

// --- CUSTOM HOOKS ---
const useEmployeeStats = (userId: string) => {
    const [stats, setStats] = useState<EmployeeStats>({
        todaysMeetings: 0,
        pendingActions: 0,
        availableRooms: 0,
        totalRooms: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [roomsResponse, userMeetingsResponse, actionItemsResponse] = await Promise.allSettled([
                    api.get('/Rooms'),
                    api.get(`/Users/${userId}/meetings`),
                    api.get(`/Users/${userId}/action-items`)
                ]);

                const rooms = roomsResponse.status === 'fulfilled' ? roomsResponse.value.data.rooms || [] : [];
                const meetings = userMeetingsResponse.status === 'fulfilled' ? userMeetingsResponse.value.data.meetings || [] : [];
                const actionItems = actionItemsResponse.status === 'fulfilled' ? actionItemsResponse.value.data.actionItems || [] : [];

                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const todayEnd = new Date(todayStart);
                todayEnd.setDate(todayEnd.getDate() + 1);

                const todaysMeetings = meetings.filter(meeting => {
                    const meetingDate = new Date(meeting.startTime);
                    return meetingDate >= todayStart && meetingDate < todayEnd;
                });

                const pendingActions = actionItems.filter(item =>
                    item.status === 'Pending' || item.status === 'In Progress'
                ).length;

                setStats({
                    todaysMeetings: todaysMeetings.length,
                    pendingActions,
                    availableRooms: rooms.filter(room => room.status !== 'occupied').length,
                    totalRooms: rooms.length
                });
            } catch (error) {
                console.error('Error fetching employee stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchStats();
        }
    }, [userId]);

    return { stats, isLoading };
};

const useUpcomingMeetings = (userId: string) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await api.get(`/Users/${userId}/meetings`);
                const allMeetings = response.data.meetings || [];

                const now = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(now.getDate() + 7);

                const upcomingMeetings = allMeetings
                    .filter(meeting => {
                        const meetingDate = new Date(meeting.startTime);
                        return meetingDate > now && meetingDate <= nextWeek;
                    })
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .slice(0, 5);

                setMeetings(upcomingMeetings);
            } catch (error) {
                console.error('Error fetching upcoming meetings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchMeetings();
        }
    }, [userId]);

    return { meetings, isLoading };
};

const useRoomAvailability = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/Rooms');
                setRooms(response.data.rooms || []);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return { rooms, isLoading };
};

// --- DASHBOARD WIDGETS ---
const UpcomingMeetings = React.memo(({ userId }) => {
    const { meetings, isLoading } = useUpcomingMeetings(userId);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        let dayText = date.toLocaleDateString();
        if (date.toDateString() === today.toDateString()) {
            dayText = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dayText = 'Tomorrow';
        }

        return {
            day: dayText,
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled': return 'text-blue-600 bg-blue-100';
            case 'in_progress': return 'text-green-600 bg-green-100';
            case 'completed': return 'text-gray-600 bg-gray-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    return (
        <AnimatedWrapper delay={0.7}>
            {/* MINIMAL CHANGE: Added flex flex-col to enable child element to grow */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800">Upcoming Meetings</h3>
                    <a href="/dashboard/meetings">
                        <DefaultButton variant="outline" size="sm">View All</DefaultButton>
                    </a>
                </div>

                {/* MINIMAL CHANGE: This container will now grow and become scrollable */}
                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><ContentSpinner /></div>
                    ) : meetings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>No upcoming meetings</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {meetings.map(meeting => {
                                const { day, time } = formatDateTime(meeting.startTime);
                                return (
                                    <div key={meeting.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50">
                                        <div className="flex-shrink-0 text-center">
                                            <div className="text-xs font-medium text-slate-500">{day}</div>
                                            <div className="text-sm font-bold text-slate-800">{time}</div>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-semibold text-slate-800 truncate">{meeting.title}</h4>
                                            <p className="text-sm text-slate-600 flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {meeting.roomName || `Room ${meeting.roomId}`}
                                            </p>
                                            {meeting.attendeesCount && (
                                                <p className="text-xs text-slate-500 flex items-center mt-1">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {meeting.attendeesCount} attendees
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                                            {meeting.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AnimatedWrapper>
    );
});

const RoomAvailability = React.memo(() => {
    const { rooms, isLoading } = useRoomAvailability();

    const getStatusInfo = (room: Room) => {
        const isAvailable = !room.status || room.status.toLowerCase() === 'available';
        return {
            label: isAvailable ? 'Available' : room.status || 'Unknown',
            colorClass: isAvailable ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        };
    };

    return (
        <AnimatedWrapper delay={0.8}>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Room Availability</h3>
                    <a href="/dashboard/rooms">
                        <DefaultButton variant="outline" size="sm">View All Rooms</DefaultButton>
                    </a>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48"><ContentSpinner /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rooms.map(room => {
                            const statusInfo = getStatusInfo(room);
                            return (
                                <div key={room.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center">
                                            <Building className="h-4 w-4 text-slate-400 mr-2" />
                                            <h4 className="font-semibold text-slate-800">{room.name}</h4>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.colorClass}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">Capacity: {room.capacity} people</p>
                                    {room.location && (
                                        <p className="text-sm text-slate-500 flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {room.location}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AnimatedWrapper>
    );
});

// --- MAIN EMPLOYEE DASHBOARD COMPONENT ---
export const EmployeeDashboard = () => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { stats, isLoading: statsLoading } = useEmployeeStats(userId);

    const infoCards = useMemo(() => [
        { icon: Clock, title: "Today's Meetings", value: stats.todaysMeetings.toString(), subtitle: stats.todaysMeetings === 1 ? '1 meeting today' : `${stats.todaysMeetings} meetings today`, delay: 0.1, color: 'blue', isLoading: statsLoading },
        { icon: FileText, title: 'Pending Actions', value: stats.pendingActions.toString(), subtitle: stats.pendingActions === 0 ? 'All caught up!' : 'Items need attention', delay: 0.2, color: 'yellow', isLoading: statsLoading },
        { icon: DoorOpen, title: 'Available Rooms', value: `${stats.availableRooms}`, subtitle: `Out of ${stats.totalRooms} total`, delay: 0.3, color: 'green', isLoading: statsLoading },
    ], [stats, statsLoading]);

    return (
        <>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Welcome back, {session?.user?.name || 'Employee'}!</h2>
                <p className="text-slate-500 mt-1">Here's your meeting overview for today.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {infoCards.map(card => <InfoCard key={card.title} {...card} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <QuickActionButton icon={PlusCircle} label="Schedule Meeting" delay={0.4} href="/dashboard/meetings/schedule" />
                    <QuickActionButton icon={Video} label="My Meetings" delay={0.5} href="/dashboard/meetings" />
                    <QuickActionButton icon={FileText} label="View Minutes" delay={0.6} href="/dashboard/minutes" />
                </div>
                {/* MINIMAL CHANGE: Added flex flex-col to enable child element to grow */}
                <div className="lg:col-span-2 flex flex-col">
                    <UpcomingMeetings userId={userId} />
                </div>
            </div>

            <div className="grid grid-cols-1">
                <RoomAvailability />
            </div>
        </>
    );
};

export default EmployeeDashboard;