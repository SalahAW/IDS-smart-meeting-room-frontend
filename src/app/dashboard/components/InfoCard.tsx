// Info Card for key dashboard stats
import AnimatedWrapper from "@/app/dashboard/components/AnimatedWrapper";
import {motion} from "framer-motion";

const InfoCard = ({ icon: Icon, title, value, subtitle, delay, color }) => (
    <AnimatedWrapper delay={delay}>
        <motion.div
            className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-100`}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-800">{value}</p>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                </div>
                <div className={`rounded-full p-3 bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
            </div>
        </motion.div>
    </AnimatedWrapper>
);

export default InfoCard;