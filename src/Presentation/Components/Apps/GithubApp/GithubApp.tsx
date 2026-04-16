import type { FC } from 'react';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import { ExternalLinkApp } from '@fde-desktop/fde-core';

const GITHUB_CONFIG = {
  icon: 'FiGithub',
  iconColor: '#000',
  title: 'GitHub',
  url: 'https://github.com/frannunpal',
  buttonLabel: 'Open Frannunpal Profile',
};

const GithubApp: FC<WindowContentProps> = props => (
  <ExternalLinkApp {...props} config={GITHUB_CONFIG} />
);

export default GithubApp;
