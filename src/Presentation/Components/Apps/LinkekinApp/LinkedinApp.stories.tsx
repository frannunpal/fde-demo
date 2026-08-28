import type { Meta, StoryObj } from '@storybook/react-vite';
import LinkedinApp from './LinkedinApp';
import { makeWindow } from '@/Shared/Testing/Utils';
import AppWithPickerOpen from '@fde-desktop/fde-core-test/Utils/AppWithPickerOpen';

const meta: Meta<typeof LinkedinApp> = {
  title: 'Apps/LinkedinApp',
  component: LinkedinApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof LinkedinApp>;

export const Default: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-linkedin',
        title: 'Linkedin',
        content: 'linkedin',
        fcIcon: 'FiLinkedin',
        width: 1100,
        height: 700,
        x: 0,
        y: 0,
      })}
    />
  ),
};
