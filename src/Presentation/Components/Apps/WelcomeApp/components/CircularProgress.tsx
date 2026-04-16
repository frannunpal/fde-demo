import { type FC } from 'react';
import { motion } from 'framer-motion';
import classes from './CircularProgress.module.css';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
}

const CircularProgress: FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  label,
  showValue = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={classes.container} style={{ width: size, height: size }}>
      <svg className={classes.circle} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className={classes.background}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className={classes.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showValue && (
        <div className={classes.value}>
          <span>{value}%</span>
        </div>
      )}
      {label && <span className={classes.label}>{label}</span>}
    </div>
  );
};

export default CircularProgress;
