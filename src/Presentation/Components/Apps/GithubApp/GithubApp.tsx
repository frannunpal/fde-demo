import { type FC, useEffect, useRef } from 'react';
import { Button, Text } from '@mantine/core';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import { useFiIconElement } from '@fde-desktop/fde-core';
import { PROFILE } from '@/Shared/Constants/profileData';
import classes from './GithubApp.module.css';

const GITHUB_URL = 'https://github.com/frannunpal';
const GITHUB_AVATAR = 'https://github.com/frannunpal.png';

const GITHUB_STATS = [
  { value: '30+', label: 'Repos' },
  { value: '15+', label: 'Years' },
  { value: '5+', label: 'Followers' },
];

const GithubApp: FC<WindowContentProps> = ({ notifyReady, window: win }) => {
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    hasNotified.current = true;
    notifyReady?.({
      ...(win?.contentData ?? {}),
      openInBrowser: () => {
        globalThis.window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
      },
    });
  }, [notifyReady, win]);

  const ButtonIcon = useFiIconElement('FiGithub', { size: 16 });

  const handleOpen = () => {
    globalThis.window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <img
          src={GITHUB_AVATAR}
          alt={PROFILE.name}
          className={classes.avatar}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <Text className={classes.name}>{PROFILE.name}</Text>
        <Text className={classes.handle}>@frannunpal</Text>
        <Text className={classes.bio}>
          Fullstack Developer &amp; DevOps · 15+ years building products from 0→1.
          React, Node, Kubernetes &amp; cloud.
        </Text>
        <div className={classes.stats}>
          {GITHUB_STATS.map((s) => (
            <div key={s.label} className={classes.stat}>
              <span className={classes.statValue}>{s.value}</span>
              <span className={classes.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
        <Button leftSection={ButtonIcon} onClick={handleOpen} fullWidth>
          Open Frannunpal Profile
        </Button>
      </div>
    </div>
  );
};

export default GithubApp;
