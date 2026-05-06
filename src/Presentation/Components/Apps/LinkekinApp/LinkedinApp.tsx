import { type FC, useEffect, useRef } from 'react';
import { Button } from '@mantine/core';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import { useFiIconElement } from '@fde-desktop/fde-core';
import { PROFILE, EXPERIENCE } from '@/Shared/Constants/profileData';
import classes from './LinkedinApp.module.css';

const LINKEDIN_URL =
  'https://www.linkedin.com/in/francisco-n%C3%BA%C3%B1ez-palomares-74a484171/';
const GITHUB_AVATAR = 'https://github.com/frannunpal.png';

const RECENT_EXPERIENCE = EXPERIENCE.slice(0, 2);

const LinkedinApp: FC<WindowContentProps> = ({ notifyReady, window: win }) => {
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    hasNotified.current = true;
    notifyReady?.({
      ...(win?.contentData ?? {}),
      openInBrowser: () => {
        globalThis.window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer');
      },
    });
  }, [notifyReady, win]);

  const ButtonIcon = useFiIconElement('FiLinkedin', { size: 16, color: '#0A66C2' });

  const handleOpen = () => {
    globalThis.window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <div className={classes.header}>
          <img
            src={GITHUB_AVATAR}
            alt={PROFILE.name}
            className={classes.avatar}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className={classes.headerInfo}>
            <div className={classes.name}>{PROFILE.name}</div>
            <div className={classes.headline}>{PROFILE.title}</div>
            <div className={classes.location}>{PROFILE.location}</div>
          </div>
        </div>

        <div className={classes.divider} />

        <div className={classes.sectionTitle}>Experience</div>
        <div className={classes.experience}>
          {RECENT_EXPERIENCE.map((exp) => (
            <div key={exp.company} className={classes.expItem}>
              <div className={classes.expDot} />
              <div className={classes.expInfo}>
                <div className={classes.expRole}>{exp.role}</div>
                <div className={classes.expCompany}>{exp.company}</div>
                <div className={classes.expPeriod}>{exp.period}</div>
              </div>
            </div>
          ))}
        </div>

        <Button leftSection={ButtonIcon} onClick={handleOpen} fullWidth variant="outline">
          Open Francisco Núñez Profile
        </Button>
      </div>
    </div>
  );
};

export default LinkedinApp;
