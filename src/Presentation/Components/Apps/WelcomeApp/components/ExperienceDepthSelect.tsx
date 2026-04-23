import { type FC, useMemo } from 'react';
import { Card, Text, Box } from '@mantine/core';
import { DepthSelect, type DepthSelectItem } from '@gfazioli/mantine-depth-select';
import { useSettingsStore } from '@fde-desktop/fde-core';
import classes from './ExperienceDepthSelect.module.css';

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  logo?: string;
}

interface ExperienceDepthSelectProps {
  experiences: Experience[];
}

const ExperienceCardView: FC<{ experience: Experience }> = ({ experience }) => {
  const logoStyle = experience.logo
    ? {
        backgroundImage: `url(${experience.logo})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <Card shadow="sm" p="lg" withBorder h="100%" orientation="horizontal" className={classes.card}>
      <Card.Section inheritPadding withBorder style={logoStyle} className={classes.logoSection}>
        {!experience.logo && (
          <>
            <Text fw={600} size="lg">
              {experience.company}
            </Text>
            <Text size="sm" c="dimmed">
              {experience.period}
            </Text>
          </>
        )}
        {experience.logo && <Box />}
      </Card.Section>
      <Card.Section inheritPadding withBorder>
        <Text fw={600} size="lg">
          {experience.company}
        </Text>
        <Text size="sm" c="dimmed">
          {experience.period}
        </Text>
        <Text size="sm" c="blue" mb="xs">
          {experience.role}
        </Text>
        <Text size="sm" c="dimmed">
          {experience.description}
        </Text>
      </Card.Section>
    </Card>
  );
};

const ExperienceDepthSelect: FC<ExperienceDepthSelectProps> = ({ experiences }) => {
  const animationDuration = useSettingsStore(state => state.animationDuration);
  // Convert seconds to milliseconds for DepthSelect
  const transitionDurationMs = animationDuration * 1000;

  const data: DepthSelectItem[] = useMemo(
    () =>
      experiences.map(exp => ({
        value: exp.company,
        view: <ExperienceCardView experience={exp} />,
      })),
    [experiences],
  );

  return (
    <Box className={classes.container}>
      <DepthSelect
        data={data}
        w="100%"
        h={180}
        loop
        withScrollNavigation
        visibleCards={3}
        transitionDuration={transitionDurationMs}
      />
    </Box>
  );
};

export default ExperienceDepthSelect;
