import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
export function PageTransition({ children }) {
    const reduce = useReducedMotion();
    if (reduce)
        return _jsx(_Fragment, { children: children });
    return (_jsx(AnimatePresence, { mode: "wait", initial: false, children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, children: children }) }));
}
