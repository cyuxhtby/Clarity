'use client';

import { CacheProvider } from '@chakra-ui/next-js';

import { Chakra as ChakraProvider } from '~/lib/components/Chakra';

import { AuthProvider } from '~/lib/contexts/AuthContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CacheProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </CacheProvider>
    </AuthProvider>
  );
};

export default Providers;
