import type { FC } from 'react';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import { ExternalLinkApp } from '@fde-desktop/fde-core';

const LINKEDIN_CONFIG = {
  icon: 'FiLinkedin',
  iconColor: '#0A66C2',
  title: 'LinkedIn',
  url: 'https://www.linkedin.com/in/francisco-n%C3%BA%C3%B1ez-palomares-74a484171/',
  buttonLabel: 'Open Francisco Núñez Profile',
};

const LinkedinApp: FC<WindowContentProps> = props => (
  <ExternalLinkApp {...props} config={LINKEDIN_CONFIG} />
);

export default LinkedinApp;
