"use client"

import React, { useState, useEffect } from 'react';
import { Flex, Box, Container } from '@chakra-ui/react';
import SwipeableViews from 'react-swipeable-views';
import { useAuth } from '~/lib/contexts/AuthContext';
import { useView } from '~/lib/contexts/ViewContext';
import SignIn from '~/lib/components/SignIn';
import Welcome from '~/lib/components/Welcome';
import Countdown from '~/lib/components/Countdown';
import Notes from '~/lib/components/Notes';
import ClockIn from '~/lib/components/ClockIn';
import ActivityPlanner from '~/lib/components/ActivityPlanner';

const Home = () => {
  const { user } = useAuth();
  const { currentView, setCurrentView, viewOrder } = useView();
  const viewComponents = [ Welcome, Countdown, Notes, ActivityPlanner, ClockIn];
  const viewIndex = viewOrder.indexOf(currentView);

  useEffect(() => {
    setCurrentView(user ? 'welcome' : 'signin');
  }, [user, setCurrentView]);

  const handleSwipeChangeIndex = (index: any) => {
    const newView = viewOrder[index];
    setCurrentView(newView);
  };

  const swipeLeft = () => viewIndex > 0 && handleSwipeChangeIndex(viewIndex - 1);
  const swipeRight = () => viewIndex < viewComponents.length - 1 && handleSwipeChangeIndex(viewIndex + 1);

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={4}
      mb={0}
      w="full"
      position="relative"
    >
      {/* Clickable overlays */}
      {viewIndex !== 0 && (
        <Box
          position="fixed"
          left={0}
          top="70px"
          bottom="40px"
          w="50vw"
          onClick={swipeLeft}
          cursor="w-resize"
          zIndex="0"
        />
      )}
      {viewIndex !== viewComponents.length - 1 && (
        <Box
          position="fixed"
          right={0}
          top="70px"
          bottom="40px"
          w="50vw"
          onClick={swipeRight}
          cursor="e-resize"
          zIndex="0"
        />
      )}
      {!user ? (
        <SignIn />
      ) : (
        <Container maxW="container.xl" p={0}>
          <SwipeableViews
            index={viewIndex}
            onChangeIndex={handleSwipeChangeIndex}
            enableMouseEvents
            animateHeight
            style={{ width: '100%', cursor: 'default' }}
          >
            {viewComponents.map((Component, i) => (
              <Box key={i} w="full" h="auto">
                <Component />
              </Box>
            ))}
          </SwipeableViews>
        </Container>
      )}
    </Flex>
  );
};

export default Home;

