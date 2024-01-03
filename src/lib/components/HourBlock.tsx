import React, { useState, useEffect } from 'react';
import { Text, Input, Button, HStack } from '@chakra-ui/react';

interface HourBlockProps {
  hour: string;
  activity?: string;
  saveActivity: (hour: string, activity: string) => void;
  deleteActivity: (hour: string) => void;
}

const HourBlock: React.FC<HourBlockProps> = ({ hour, activity = '', saveActivity, deleteActivity }) => {
  const [currentActivity, setCurrentActivity] = useState(activity);

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
    <HStack w="100%" justifyContent="space-between" alignItems="center">
      <Text width="50px">{hour}</Text>
      <Input
        placeholder="Add activity..."
        value={currentActivity}
        onChange={(e) => setCurrentActivity(e.target.value)}
        flex="1"
      />
      {activity ? (
        <Button onClick={handleDelete} px="5">-</Button>
      ) : (
        <Button onClick={handleSave} px="5">+</Button>
      )}
    </HStack>
  );
};

export default HourBlock;
