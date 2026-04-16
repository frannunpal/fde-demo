import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Text, Progress } from '@mantine/core';
import classes from './SkillsBar.module.css';

interface Skill {
  name: string;
  level: number;
}

interface SkillsBarProps {
  skills: Skill[];
  title?: string;
}

const SkillsBar: FC<SkillsBarProps> = ({ skills, title }) => {
  return (
    <div className={classes.container}>
      {title && (
        <Text fw={600} mb="sm">
          {title}
        </Text>
      )}
      <div className={classes.skills}>
        {skills.map((skill, index) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={classes.skillItem}
          >
            <div className={classes.skillHeader}>
              <Text size="sm">{skill.name}</Text>
              <Text size="sm" c="dimmed">
                {skill.level}%
              </Text>
            </div>
            <Progress
              value={skill.level}
              size="sm"
              radius="sm"
              classNames={{
                root: classes.progressRoot,
                section: classes.progressSection,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillsBar;
