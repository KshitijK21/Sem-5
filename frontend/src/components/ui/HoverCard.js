import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function HoverCard({ children, className = '' }) {
    return (_jsx(motion.div, { className: className, whileHover: { y: -2 }, transition: { duration: 0.15 }, style: { willChange: 'transform' }, children: children }));
}
