import { type FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Title, Stack, Divider, Group } from '@mantine/core';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import HeroSection from './components/HeroSection';
import SkillsBar from './components/SkillsBar';
import TechTags from './components/TechTags';
import ExperienceCard from './components/ExperienceCard';
import CircularProgress from './components/CircularProgress';
import { EXPERIENCE, SKILLS, LANGUAGES, TECH_STACK } from '@/Shared/Constants/profileData';
import classes from './WelcomeApp.module.css';

const WelcomeApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const { t } = useTranslation('welcome');

  useEffect(() => {
    notifyReady?.({});
  }, [notifyReady]);

  return (
    <div className={classes.container} data-windowid={win?.id}>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <HeroSection />

          <Divider />

          <div data-testid="skills-section">
            <Stack gap="md">
              <Title order={3}>{t('skills.technical')}</Title>
              <SkillsBar skills={SKILLS.technical} />
            </Stack>
          </div>

          <div>
            <Title order={4} mb="sm">
              {t('skills.soft')}
            </Title>
            <SkillsBar skills={SKILLS.soft} />
          </div>

          <Divider />

          <div>
            <Title order={3} mb="md">
              {t('languages')}
            </Title>
            <Group gap="lg">
              {LANGUAGES.map(lang => (
                <CircularProgress key={lang.code} value={lang.level} size={80} label={lang.name} />
              ))}
            </Group>
          </div>

          <Divider />

          <div>
            <Title order={3} mb="md">
              {t('techStack')}
            </Title>
            <TechTags tags={TECH_STACK} />
          </div>

          <Divider />

          <div>
            <Title order={3} mb="md">
              {t('experience')}
            </Title>
            <Stack gap="md">
              {EXPERIENCE.map((exp, index) => (
                <ExperienceCard key={exp.company} experience={exp} index={index} />
              ))}
            </Stack>
          </div>
        </Stack>
      </Container>
    </div>
  );
};

export default WelcomeApp;
