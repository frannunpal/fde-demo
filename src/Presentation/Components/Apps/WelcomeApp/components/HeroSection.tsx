import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Text, Group, Button, Avatar, Image } from '@mantine/core';
import { useFiIconElement } from '@fde-desktop/fde-core';
import { PROFILE } from '@/Shared/Constants/profileData';
import { fadeSlideUp } from '../motionVariants';
import classes from './HeroSection.module.css';
import Yo from '/Yo.jpg';

const HeroSection: FC = () => {
  const { t, i18n } = useTranslation('welcome');

  const handleDownloadCV = () => {
    const cvPath = i18n.language === 'es' ? PROFILE.cvUrls.es : PROFILE.cvUrls.en;
    const base = import.meta.env.BASE_URL;
    window.open(`${base}${cvPath}`, '_blank');
  };

  const handleContactMe = () => {
    window.location.href = `mailto:${PROFILE.email}`;
  };

  const LinkedInIcon = useFiIconElement('FiLinkedin', { size: 32 });
  const GitHubIcon = useFiIconElement('FiGithub', { size: 32 });

  return (
    <Box className={classes.hero} data-testid="hero-section">
      <div className={classes.background} aria-hidden="true" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className={classes.avatarWrapper}>
          <Avatar size={160} radius="xl" className={classes.avatar}>
            <Image src={Yo} />
          </Avatar>
        </div>
      </motion.div>

      <motion.div {...fadeSlideUp(0.2)}>
        <Text fw={800} className={classes.name}>
          {PROFILE.name}
        </Text>
        <Text c="dimmed" size="lg" mt={4}>
          {t('hero.title')}
        </Text>
        <Text className={classes.bio} mt="xs">
          Fullstack developer with 15+ years building products from 0→1. Specialized in React, Node,
          Kubernetes & cloud.
        </Text>
      </motion.div>

      <motion.div {...fadeSlideUp(0.4)}>
        <Group className={classes.links}>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className={classes.iconLink}
          >
            {LinkedInIcon}
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={classes.iconLink}
          >
            {GitHubIcon}
          </a>
        </Group>
      </motion.div>

      <motion.div {...fadeSlideUp(0.6)}>
        <Group className={classes.actions}>
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 135 }}
            onClick={handleDownloadCV}
          >
            {t('hero.downloadCV')}
          </Button>
          <Button variant="outline" onClick={handleContactMe}>
            {t('hero.contactMe')}
          </Button>
        </Group>
      </motion.div>
    </Box>
  );
};

export default HeroSection;
