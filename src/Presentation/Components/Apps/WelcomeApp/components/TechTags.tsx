import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Badge, Group } from '@mantine/core';
import classes from './TechTags.module.css';

interface TechTagsProps {
  tags: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const tagVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const TechTags: FC<TechTagsProps> = ({ tags }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Group gap="xs" wrap="wrap">
        {tags.map(tag => (
          <motion.div key={tag} variants={tagVariants}>
            <Badge variant="light" size="sm" classNames={{ root: classes.badge }}>
              {tag}
            </Badge>
          </motion.div>
        ))}
      </Group>
    </motion.div>
  );
};

export default TechTags;
