"use client"
import React from 'react';
import { useAuth } from '~/lib/contexts/AuthContext';

import { Flex } from '@chakra-ui/react';

import SignIn from '~/lib/components/SignIn';
import { Welcome } from '~/lib/components/Welcome';


const Home = () => {
  const { user } = useAuth();
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={4}
      mb={8}
      w="full"
    >
      {user ? <Welcome /> : <SignIn />}
    </Flex>
  );
};

export default Home;
