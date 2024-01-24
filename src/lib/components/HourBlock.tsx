import React, { useState, useEffect } from 'react';
import { Text, Textarea, Button, HStack, Box, useColorModeValue } from '@chakra-ui/react';

interface HourBlockProps {
  hour: string;
  activity?: string;
  saveActivity: (hour: string, activity: string) => void;
  deleteActivity: (hour: string) => void;
}

const HourBlock: React.FC<HourBlockProps> = ({ hour, activity = '', saveActivity, deleteActivity }) => {
  const [currentActivity, setCurrentActivity] = useState(activity);
  const bg = useColorModeValue('gray.50', 'gray.700');


  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  const handleSave = () => {
    if (currentActivity.trim() !== '') {
      saveActivity(hour, currentActivity);
    }
  };

  const handleDelete = () => {
    deleteActivity(hour);
  };

  return (
    <HStack w="100%" bg={bg} p={4} borderWidth="1px" borderRadius="lg" spacing={4} alignItems="center">
      <Box  display="flex" justifyContent="center">
        <Text fontSize="md" fontWeight="medium">{hour}</Text>
      </Box>
      <Box flex="1">
        <Textarea
          placeholder="Add activity..."
          value={currentActivity}
          onChange={(e) => setCurrentActivity(e.target.value)}
          resize="none"
          minH="30px" 
          
        />
      </Box>
      <Button
        onClick={activity ? handleDelete : handleSave}
        size="sm"
      >
        {activity ? '-' : '+'}
      </Button>
    </HStack>
  );
};

export default HourBlock;
