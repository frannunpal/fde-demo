import { type FC, useState } from 'react';
import { Text, Paper, Stack, Group, SegmentedControl } from '@mantine/core';
import { motion } from 'framer-motion';
import { LineChart } from '@mantine/charts';
import { SKILL_YEARS, EXPERIENCE } from '@/Shared/Constants/profileData';
import classes from './SkillsBar.module.css';

interface Skill {
  name: string;
  level: number;
  history: number[];
}

interface SkillsBarProps {
  skills: Skill[];
  title?: string;
}

const COLORS = [
  'indigo.6',
  'blue.5',
  'teal.5',
  'violet.5',
  'cyan.5',
  'grape.5',
  'pink.5',
  'orange.5',
];

const yearToCompany = (year: number): string => {
  for (const exp of EXPERIENCE) {
    const [start, end] = exp.period.split(' - ');
    const startYear = parseInt(start);
    const endYear = end === 'Present' ? 2026 : parseInt(end);
    if (year >= startYear && year <= endYear) return exp.company;
  }
  return '';
};

const renderTooltip =
  (seriesColors: Record<string, string>) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: any) => {
    const { active, payload, label } = props;
    if (!active || !payload?.length) return null;

    const company = yearToCompany(Number(label));

    return (
      <Paper px="md" py="sm" withBorder shadow="sm" radius="md">
        <Stack gap={4}>
          <Text fw={700} size="sm">
            {label}
          </Text>
          {company && (
            <Text size="xs" c="dimmed" mb={4}>
              @ {company}
            </Text>
          )}
          {payload.map((entry: { name: string; value: number; color: string }) => (
            <Text
              key={entry.name}
              size="xs"
              style={{ color: seriesColors[entry.name] ?? entry.color }}
            >
              {entry.name}: {entry.value}%
            </Text>
          ))}
        </Stack>
      </Paper>
    );
  };

const CurrentBarsView: FC<{ skills: Skill[] }> = ({ skills }) => (
  <div className={classes.barsContainer}>
    {skills.map((skill, index) => (
      <div key={skill.name} className={classes.barRow}>
        <Text size="sm" className={classes.barLabel}>
          {skill.name}
        </Text>
        <div className={classes.barTrack}>
          <motion.div
            className={classes.barFill}
            initial={{ width: 0 }}
            animate={{ width: `${skill.level}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
          />
        </div>
        <Text size="xs" fw={600} className={classes.barValue}>
          {skill.level}%
        </Text>
      </div>
    ))}
  </div>
);

const SkillsBar: FC<SkillsBarProps> = ({ skills, title }) => {
  const [view, setView] = useState<'current' | 'history'>('current');

  const data = SKILL_YEARS.map((year, i) => {
    const point: Record<string, number | string> = { year: String(year) };
    skills.forEach(skill => {
      point[skill.name] = skill.history[i];
    });
    return point;
  });

  const series = skills.map((skill, i) => ({
    name: skill.name,
    color: COLORS[i % COLORS.length],
  }));

  const seriesColors = Object.fromEntries(
    series.map(s => [s.name, `var(--mantine-color-${s.color.replace('.', '-')})`]),
  );

  return (
    <div className={classes.container}>
      <Group justify="space-between" mb="sm" align="center">
        {title && (
          <Text fw={600} size="sm">
            {title}
          </Text>
        )}
        <SegmentedControl
          size="xs"
          value={view}
          onChange={v => setView(v as 'current' | 'history')}
          data={[
            { label: '≡ Current', value: 'current' },
            { label: '📈 History', value: 'history' },
          ]}
          className={classes.toggle}
        />
      </Group>

      {view === 'current' ? (
        <CurrentBarsView skills={skills} />
      ) : (
        <LineChart
          h={220}
          data={data}
          dataKey="year"
          withLegend
          withDots={false}
          withTooltip
          tooltipProps={{ content: renderTooltip(seriesColors) }}
          series={series}
          yAxisProps={{ domain: [0, 100] }}
          tickLine="none"
          gridAxis="y"
          curveType="natural"
        />
      )}
    </div>
  );
};

export default SkillsBar;
