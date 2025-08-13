"use client";

import { motion } from "framer-motion";

const AnimatedWrapper = ({ children, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} className="h-full">
        {children}
    </motion.div>
);

// Expanded data to demonstrate scrolling
const activityFeedData = [
    { user: 'Admin', action: 'Created new room "Aquila"', time: '5m ago' },
    { user: 'Jane Smith', action: 'Reported issue with projector in "Orion"', time: '1h ago' },
    { user: 'System', action: 'Server maintenance scheduled for 10 PM', time: '3h ago' },
    { user: 'John Doe', action: 'Booked "Pegasus" for 3 hours', time: '5h ago' },
    { user: 'Alice Brown', action: 'Cancelled meeting "Weekly Sync"', time: '6h ago' },
    { user: 'System', action: 'User "Sam Wilson" password was reset', time: '8h ago' },
    { user: 'Admin', action: 'Updated booking policies', time: '1d ago' },
    { user: 'Mike Ross', action: 'Joined meeting "Frontend Sync-up"', time: '1d ago' },
];

const ActivityFeed = () => (
    <AnimatedWrapper delay={0.4}>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex-shrink-0">Recent Activity</h3>
            <div className="overflow-y-auto flex-grow pr-2">
                <ul className="h-96 space-y-8">
                    {activityFeedData.map((item, i) => (
                        <li key={i} className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0"></div>
                            <div className="ml-3">
                                <p className="text-sm text-slate-700"><span className="font-semibold">{item.user}</span> {item.action}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </AnimatedWrapper>
);

export default ActivityFeed;