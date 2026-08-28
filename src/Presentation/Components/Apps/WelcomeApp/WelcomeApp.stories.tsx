import type { Meta, StoryObj } from '@storybook/react-vite';
import WelcomeApp from './WelcomeApp';
import { Window } from '@fde-desktop/fde-core';
import { WindowButtonRegistryProvider } from '@fde-desktop/fde-core';
import { useDesktopStore } from '@fde-desktop/fde-core';
import { useEffect } from 'react';
import { makeWindow } from '@/Shared/Testing/Storybook';

const meta: Meta<typeof WelcomeApp> = {
  title: 'Apps/WelcomeApp',
  component: WelcomeApp,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.setState({
          windows: [],
        });
      }, []);
      return (
        <WindowButtonRegistryProvider>
          <Story />
        </WindowButtonRegistryProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof WelcomeApp>;

export const Default: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 800, height: 600 }}>
      <Window
        window={makeWindow({
          title: 'Welcome',
          content: 'welcome',
          fcIcon: 'FcHome',
          width: 800,
          height: 600,
        })}
      />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 500, height: 600 }}>
      <Window
        window={makeWindow({
          title: 'Welcome',
          content: 'welcome',
          fcIcon: 'FcHome',
          width: 500,
          height: 600,
        })}
      />
    </div>
  ),
};

export const Wide: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 1200, height: 600 }}>
      <Window
        window={makeWindow({
          title: 'Welcome',
          content: 'welcome',
          fcIcon: 'FcHome',
          width: 1200,
          height: 600,
        })}
      />
    </div>
  ),
};
