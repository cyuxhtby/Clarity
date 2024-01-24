'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { Chakra as ChakraProvider } from '~/lib/components/Chakra';
import { AuthProvider } from '~/lib/contexts/AuthContext';
import { ViewProvider } from '~/lib/contexts/ViewContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ViewProvider>
      <CacheProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </CacheProvider>
      </ViewProvider>
    </AuthProvider>
  );
};

export default Providers;
