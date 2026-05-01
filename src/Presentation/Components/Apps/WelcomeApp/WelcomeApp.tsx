import { type FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Title, Stack, Divider, Group } from '@mantine/core';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import HeroSection from './components/HeroSection';
import SkillsBar from './components/SkillsBar';
import TechTags from './components/TechTags';
import ExperienceDepthSelect from './components/ExperienceDepthSelect';
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

          <div>
            <div className={classes.sectionHeader}>
              <Title order={3} mb="md">
                {t('experience')}
              </Title>
            </div>
            <ExperienceDepthSelect experiences={EXPERIENCE} />
          </div>

          <Divider />

          <div data-testid="skills-section">
            <Stack gap="md">
              <div className={classes.sectionHeader}>
                <Title order={3}>{t('skills.technical')}</Title>
              </div>
              <SkillsBar skills={SKILLS.technical} />
            </Stack>
          </div>

          <Divider />

          <Group align="flex-start" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr' }}>
            <div>
              <div className={classes.sectionHeader}>
                <Title order={4} mb="sm">
                  {t('languages')}
                </Title>
              </div>
              <Group gap="lg">
                {LANGUAGES.map(lang => (
                  <CircularProgress
                    key={lang.code}
                    value={lang.level}
                    size={80}
                    label={lang.name}
                  />
                ))}
              </Group>
            </div>

            <div>
              <div className={classes.sectionHeader}>
                <Title order={4} mb="sm">
                  {t('skills.soft')}
                </Title>
              </div>
              <SkillsBar skills={SKILLS.soft} />
            </div>
          </Group>

          <Divider />

          <div>
            <div className={classes.sectionHeader}>
              <Title order={3} mb="md">
                {t('techStack')}
              </Title>
            </div>
            <TechTags tags={TECH_STACK} />
          </div>
        </Stack>
      </Container>
    </div>
  );
};

export default WelcomeApp;
