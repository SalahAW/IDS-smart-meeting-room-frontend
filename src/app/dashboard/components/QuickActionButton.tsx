// Quick Action Button Component
import AnimatedWrapper from "@/app/dashboard/components/AnimatedWrapper";
import { motion } from "framer-motion";

const QuickActionButton = ({ icon: Icon, label, delay }) => (
    <AnimatedWrapper delay={delay}>
        <motion.button
            className="flex flex-col items-center justify-center w-full h-28 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="p-3 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
                <Icon className="h-6 w-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </motion.div>
            <p className="mt-2 text-sm font-semibold text-slate-700">{label}</p>
        </motion.button>
    </AnimatedWrapper>
);

export default QuickActionButton;