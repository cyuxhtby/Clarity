import React from 'react';
import { VStack, Text, Button, Box } from '@chakra-ui/react';
import AddTask from '~/lib/components/modals/AddTask'

export const Welcome = () => {
 
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();


  return (
    <VStack
      spacing={4}
      justifyContent="center"
      alignItems="center"
      height="100%"
      p={2}
    >
      <Box textAlign="center" mb={20}>
        <Text fontSize="6xl" fontWeight="bold" mb={2}>
          {day}
        </Text>
        <Text fontSize="2xl" fontWeight="bold">
          {date}
        </Text>
        <Text fontSize="5xl" fontWeight="bold" mt={2}>
          {time}
        </Text>
      </Box>
      <Box mt={10}>
      <AddTask/>
      </Box>
    </VStack>
  );
};

export default Welcome;