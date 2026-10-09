import { jsx as _jsx } from "react/jsx-runtime";
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
export function FadeIn({ children, delay = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const reduce = useReducedMotion();
    if (reduce)
        return _jsx("div", { ref: ref, children: children });
    return (_jsx(motion.div, { ref: ref, initial: { opacity: 0, y: 16 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.4, delay }, children: children }));
}
