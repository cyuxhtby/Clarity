import React, { useState, useEffect, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '0';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };
    adjustHeight();
  }, [currentActivity]);

  const handleSave = () => {
    if (currentActivity.trim() !== '') {
      saveActivity(hour, currentActivity);
    }
  };

  const handleDelete = () => {
    deleteActivity(hour);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentActivity(e.target.value);
  };

  return (
    <HStack w="100%" bg={bg} p={4} borderWidth="1px" borderRadius="lg" spacing={4} alignItems="center">
      <Box display="flex" justifyContent="center" alignItems="center">
        <Text fontSize="md" fontWeight="medium">{hour}</Text>
      </Box>
      <Box flex="1">
        <Textarea
          ref={textareaRef}
          placeholder="Add activity..."
          value={currentActivity}
          onChange={handleChange}
          resize="none"
          height="20px" 
          minHeight="20px" 
          overflowY="hidden" 
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
