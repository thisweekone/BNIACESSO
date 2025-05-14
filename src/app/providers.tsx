'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#ffeaea',
      100: '#ffd6d9',
      200: '#ffb3b8',
      300: '#ff8a93',
      400: '#ff5f6e',
      500: '#E9162B',
      600: '#b80f1e',
      700: '#990c19',
      800: '#7a0914',
      900: '#5c060f',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}