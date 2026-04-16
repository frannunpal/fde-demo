import React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

const testTheme = createTheme({});

export const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MantineProvider theme={testTheme}>{children}</MantineProvider>;
};
