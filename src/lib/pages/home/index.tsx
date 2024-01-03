'use client'

import React, { useState, useEffect } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import SignIn from '~/lib/components/SignIn';
import { Welcome } from '~/lib/components/Welcome';
import Countdown from '~/lib/components/Countdown';
import Notes from '~/lib/components/Notes'; 
import ClockIn from '~/lib/components/ClockIn';
import { useAuth } from '~/lib/contexts/AuthContext';
import ActivityPlanner from '~/lib/components/ActivityPlanner';

const Home = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState(user ? 'welcome' : 'SignIn');

  useEffect(() => {
    setCurrentView(user ? 'welcome' : 'SignIn');
  }, [user]);

  const variants = {
    initial: { opacity: 0, y: 20 }, 
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut" } }, 
    exit: { opacity: 0, y: -30, transition: { duration: 0.7, ease: "easeInOut" } }, 
  };

  const viewOrder = ['SignIn', 'welcome', 'countdown', 'notes', 'activityPlanner', 'clockIn'];

  const swipeRight = () => {
    const currentIndex = viewOrder.indexOf(currentView);
    if (currentIndex < viewOrder.length - 1) {
      setCurrentView(viewOrder[currentIndex + 1]);
    }
  };

  const swipeLeft = () => {
    const currentIndex = viewOrder.indexOf(currentView);
    if (currentIndex > 0) {
      setCurrentView(viewOrder[currentIndex - 1]);
    }
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

  const headerHeight = '70px'; 
  const footerHeight = '40px'; 

  const showLeftOverlay = currentView !== 'welcome' && currentView !== 'SignIn';
  const showRightOverlay = currentView !== 'clockIn' && currentView !== 'SignIn';

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={4}
      mb={8}
      w="full"
      position="relative"
    >
    
        <>
          {showLeftOverlay && (
            <Box
              position="fixed"
              left={0}
              top={headerHeight}
              bottom={footerHeight}
              w="50vw"
              onClick={swipeLeft}
              cursor="w-resize" 
              zIndex="10"
            />
          )}
          {showRightOverlay && (
            <Box
              position="fixed"
              right={0}
              top={headerHeight}
              bottom={footerHeight}
              w="50vw"
              onClick={swipeRight}
              cursor="e-resize" 
              zIndex="10"
            />
          )}
        </>
     
      {/* Main content */}
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
             {currentView === 'welcome' && <Welcome />}
             {currentView === 'countdown' && <Countdown />}
             {currentView === 'notes' && <Notes />}
             {currentView === 'clockIn' && <ClockIn />}
             {currentView === 'activityPlanner' && <ActivityPlanner />} 
            
          </motion.div>
        </AnimatePresence>
      )}
    </Flex>
  );
};

export default Home;
