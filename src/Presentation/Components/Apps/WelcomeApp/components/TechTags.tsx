import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Badge, Group } from '@mantine/core';
import { staggerContainer, staggerChild } from '../motionVariants';
import classes from './TechTags.module.css';

interface TechTag {
  name: string;
  url: string;
}

interface TechTagsProps {
  tags: TechTag[];
}

const TechTags: FC<TechTagsProps> = ({ tags }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Group gap="xs" wrap="wrap">
        {tags.map(tag => (
          <motion.div key={tag.name} variants={staggerChild}>
            <Badge
              component="a"
              href={tag.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              size="sm"
              classNames={{ root: classes.badge }}
              style={{ cursor: 'pointer' }}
            >
              {tag.name}
            </Badge>
          </motion.div>
        ))}
      </Group>
    </motion.div>
  );
};

export default TechTags;
