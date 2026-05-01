import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Badge, Group, Text, Stack } from '@mantine/core';
import { staggerContainer, staggerChild } from '../motionVariants';
import classes from './TechTags.module.css';

interface TechTag {
  name: string;
  url: string;
}

interface TechTagsProps {
  tags: TechTag[];
}

type Category = 'Frontend' | 'Backend' | 'DevOps' | 'Database' | 'Testing' | 'Tools';

const CATEGORY_MAP: Record<string, { label: Category; color: string }> = {
  React: { label: 'Frontend', color: 'blue' },
  TypeScript: { label: 'Frontend', color: 'blue' },
  Mantine: { label: 'Frontend', color: 'blue' },
  SCSS: { label: 'Frontend', color: 'blue' },
  Tailwind: { label: 'Frontend', color: 'blue' },
  'deck.gl': { label: 'Frontend', color: 'blue' },
  'Node.js': { label: 'Backend', color: 'teal' },
  NestJS: { label: 'Backend', color: 'teal' },
  Python: { label: 'Backend', color: 'teal' },
  Django: { label: 'Backend', color: 'teal' },
  Kubernetes: { label: 'DevOps', color: 'orange' },
  Docker: { label: 'DevOps', color: 'orange' },
  Helm: { label: 'DevOps', color: 'orange' },
  Jenkins: { label: 'DevOps', color: 'orange' },
  GCP: { label: 'DevOps', color: 'orange' },
  AWS: { label: 'DevOps', color: 'orange' },
  PostgreSQL: { label: 'Database', color: 'grape' },
  MySQL: { label: 'Database', color: 'grape' },
  Firebase: { label: 'Database', color: 'grape' },
  Jest: { label: 'Testing', color: 'red' },
  'Testing Library': { label: 'Testing', color: 'red' },
  Git: { label: 'Tools', color: 'gray' },
  Jira: { label: 'Tools', color: 'gray' },
};

const CATEGORY_ORDER: Category[] = [
  'Frontend',
  'Backend',
  'DevOps',
  'Database',
  'Testing',
  'Tools',
];

const TechTags: FC<TechTagsProps> = ({ tags }) => {
  const grouped = CATEGORY_ORDER.reduce<Record<Category, TechTag[]>>(
    (acc, cat) => ({ ...acc, [cat]: [] }),
    {} as Record<Category, TechTag[]>,
  );

  for (const tag of tags) {
    const cat = CATEGORY_MAP[tag.name]?.label ?? 'Tools';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tag);
  }

  return (
    <Stack gap="md">
      {CATEGORY_ORDER.map(category => {
        const categoryTags = grouped[category];
        if (!categoryTags?.length) return null;
        const color = CATEGORY_MAP[categoryTags[0].name]?.color ?? 'gray';

        return (
          <div key={category} data-testid={`category-${category}`}>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              c={color}
              mb={6}
              className={classes.categoryLabel}
            >
              {category}
            </Text>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Group gap="xs" wrap="wrap">
                {categoryTags.map(tag => (
                  <motion.div key={tag.name} variants={staggerChild}>
                    <Badge
                      component="a"
                      href={tag.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="light"
                      color={color}
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
          </div>
        );
      })}
    </Stack>
  );
};

export default TechTags;
