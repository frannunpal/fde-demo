import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Card, Text, Group } from '@mantine/core';
import classes from './ExperienceCard.module.css';

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

const ExperienceCard: FC<ExperienceCardProps> = ({ experience, index = 0 }) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card shadow="sm" padding="md" radius="md" className={classes.card}>
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="lg">
            {experience.company}
          </Text>
          <Text size="sm" c="dimmed">
            {experience.period}
          </Text>
        </Group>
        <Text size="sm" c="blue" mb="xs">
          {experience.role}
        </Text>
        <Text size="sm" c="dimmed">
          {experience.description}
        </Text>
      </Card>
    </motion.div>
  );
};

export default ExperienceCard;
