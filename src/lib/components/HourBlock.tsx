import React, { useState, useRef, useEffect } from 'react';
import { HStack, Box, Text, Textarea, useColorModeValue, VStack, Progress } from '@chakra-ui/react';
import TaskItem from './TaskItem';
import { useDroppable } from '@dnd-kit/core';
import { useSwipeable } from 'react-swipeable';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  date?: string;
  hour?: string;
}

interface HourBlockProps {
  hour: string;
  tasks: Task[];
  addTask: (hour: string, taskText: string) => void;
  removeTask: (task: Task) => void;
  assignTaskTime: (taskId: string, date: string, hour: string) => void;
  isCurrentHour?: boolean;
  isPastHour?: boolean;
}

const HourBlock: React.FC<HourBlockProps> = ({ hour, tasks, addTask, removeTask, assignTaskTime, isCurrentHour, isPastHour }) => {
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bg = useColorModeValue('gray.200', 'gray.600');
  const pastBg = useColorModeValue('gray.400', 'gray.700');
  const borderColor = useColorModeValue('whiteAlpha.50', 'white');
  const [isSwiping, setIsSwiping] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAddingTask && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingTask]);

  useEffect(() => {
    if (isCurrentHour) {
      const interval = setInterval(() => {
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        setProgress((minutes * 60 + seconds) / 36);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCurrentHour]);

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      addTask(hour, newTask);
      setNewTask('');
      setIsAddingTask(false);
    } else {
      setIsAddingTask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleBlur = () => {
    handleAddTask();
  };

  const { isOver, setNodeRef } = useDroppable({
    id: hour,
  });

  const handleClick = () => {
    if (!isSwiping && !isAddingTask) {
      setIsAddingTask(true);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiping: () => setIsSwiping(true),
    onSwiped: () => setIsSwiping(false),
  });

  return (
    <HStack
      {...swipeHandlers}
      ref={setNodeRef}
      w="100%"
      bg={isPastHour ? pastBg : bg}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      spacing={2}
      alignItems="center"
      borderColor={isOver ? borderColor : 'whiteAlpha.50'}
      overflow="hidden"
      onClick={handleClick}
      position="relative"
      mb={2}
    >
      <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
        <Text fontSize="md" fontWeight="medium">
          {hour}
        </Text>
      </Box>
      <Box flex="1" overflow="hidden">
        <VStack align="start" w="100%">
          {tasks.map((task) => (
            <TaskItem key={task.id} id={task.id} task={task} removeTask={removeTask} assignTaskTime={assignTaskTime} />
          ))}
          {isAddingTask && (
            <Textarea
              ref={textareaRef}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              resize="none"
              minHeight="20px"
              overflowY="hidden"
              w="100%"
            />
          )}
        </VStack>
      </Box>
      {isCurrentHour && (
        <Progress
          value={progress}
          size="xs"
          colorScheme="blue"
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="4px"
          borderRadius="lg"
        />
      )}
    </HStack>
  );
};

export default HourBlock;
