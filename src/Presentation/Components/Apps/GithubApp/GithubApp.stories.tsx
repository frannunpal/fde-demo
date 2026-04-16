import type { Meta, StoryObj } from '@storybook/react-vite';
import GithubApp from './GithubApp';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import AppWithPickerOpen from '@/Shared/Testing/Utils/AppWithPickerOpen';

const meta: Meta<typeof GithubApp> = {
  title: 'Apps/GithubApp',
  component: GithubApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof GithubApp>;

export const Default: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-github',
        title: 'GitHub',
        content: 'github',
        fcIcon: 'FiGithub',
        width: 640,
        height: 480,
        x: 0,
        y: 0,
      })}
    />
  ),
};
