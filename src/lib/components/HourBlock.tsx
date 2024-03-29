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
  const [isEditing, setIsEditing] = useState(!activity);
  const bg = useColorModeValue('gray.50', 'gray.700');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCurrentActivity(activity);
    setIsEditing(!activity);
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
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteActivity(hour);
    setCurrentActivity(''); 
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentActivity(e.target.value);
    // Set isEditing to true as soon as the user modifies the text
    setIsEditing(true);
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
        onClick={isEditing ? handleSave : handleDelete}
        size="sm"
        borderRadius="md"
      >
        {isEditing ? '+' : '-'}
      </Button>
    </HStack>
  );
};

export default HourBlock;
