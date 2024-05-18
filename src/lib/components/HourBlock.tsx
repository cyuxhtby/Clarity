import React, { useState, useRef, useEffect } from 'react';
import { HStack, Box, Text, Textarea, useColorModeValue, VStack } from '@chakra-ui/react';
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
  isFutureDate?: boolean;
}

const HourBlock: React.FC<HourBlockProps> = ({ hour, tasks, addTask, removeTask, assignTaskTime, isFutureDate }) => {
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bg = useColorModeValue('gray.200', 'gray.700');
  const borderColor = useColorModeValue('whiteAlpha.50', 'white');
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (isAddingTask && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingTask]);

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
      bg={bg}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      spacing={4}
      alignItems="center"
      borderColor={isOver ? borderColor : 'whiteAlpha.50'}
      overflow="hidden"
      onClick={handleClick}
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
          {isAddingTask && !isFutureDate && (
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
    </HStack>
  );
};

export default HourBlock;
