'use client'

import React, { useState, useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import SignIn from '~/lib/components/SignIn';
import { Welcome } from '~/lib/components/Welcome';
import Countdown from '~/lib/components/Countdown';
import { useAuth } from '~/lib/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('welcome');

  const variants = {
    initial: { opacity: 0, y: 20 }, 
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut" } }, 
    exit: { opacity: 0, y: -30, transition: { duration: 0.7, ease: "easeInOut" } }, 
  };

  const swipeRight = () => {
    if (currentView === 'welcome') setCurrentView('countdown');
  };

  const swipeLeft = () => {
    if (currentView === 'countdown') setCurrentView('welcome');
  };

  const swipeThreshold = 100;

  const handleSwipe = (event: any, info: any) => {
    const offset = info.offset.x;
    if (offset > swipeThreshold) {
      swipeLeft();
    } else if (offset < -swipeThreshold) {
      swipeRight();
    }
  };

  useEffect(() => {
    if (user) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, [user]); 

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
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            onDragEnd={handleSwipe}
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
