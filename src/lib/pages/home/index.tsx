'use client'

import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import SignIn from '~/lib/components/SignIn';
import { Welcome } from '~/lib/components/Welcome';
import Countdown from '~/lib/components/Countdown';
import { useAuth } from '~/lib/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('welcome'); // welcome or countdown

  const swipeRight = () => {
    if (currentView === 'welcome') setCurrentView('countdown');
  };

  const swipeLeft = () => {
    if (currentView === 'countdown') setCurrentView('welcome');
  };

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
      {!user ? (
        <SignIn />
      ) : (
        <AnimatePresence>
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            onDragEnd={(event, info) => {
              if (info.point.x > 100) swipeLeft();
              else if (info.point.x < -100) swipeRight();
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
          >
            {currentView === 'welcome' ? <Welcome /> : <Countdown />}
          </motion.div>
        </AnimatePresence>
      )}
    </Flex>
  );
};

export default Home;
