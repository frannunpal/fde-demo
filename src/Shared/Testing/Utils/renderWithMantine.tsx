import type { ReactNode } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({});

export const renderWithMantine = ({ children }: { children: ReactNode }) => (
  <MantineProvider theme={theme}>{children}</MantineProvider>
);
