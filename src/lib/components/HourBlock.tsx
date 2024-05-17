import React, { useState, useRef, useEffect } from 'react';
import { HStack, Box, Text, Textarea, useColorModeValue, IconButton, VStack } from '@chakra-ui/react';
import { MdAdd } from "react-icons/md";
import TaskItem from './TaskItem';
import { useDroppable } from '@dnd-kit/core';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface HourBlockProps {
  hour: string;
  tasks: Task[];
  addTask: (hour: string, taskText: string) => void;
  removeTask: (task: Task) => void;
  isFutureDate?: boolean;
}

const HourBlock: React.FC<HourBlockProps> = ({ hour, tasks, addTask, removeTask, isFutureDate = false }) => {
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bg = useColorModeValue('gray.200', 'gray.700');
  const isPassedBg = isPassed ? 'blackAlpha.400' : 'grey.800';


  useEffect(() => {
    if (isAddingTask && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingTask]);

  useEffect(() => {
    if (!isFutureDate) {
      const updateIsPassed = () => {
        const currentHour = new Date().getHours();
        const blockHour = parseInt(hour.split(':')[0]);
        setIsPassed(blockHour < currentHour);
      };

      updateIsPassed();
      const timer = setInterval(updateIsPassed, 120000);

      return () => {
        clearInterval(timer);
      };
    } else {
      setIsPassed(false);
    }
  }, [hour, isFutureDate]);

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      addTask(hour, newTask);
      setNewTask('');
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
    if (newTask.trim() === '') {
      setIsAddingTask(false);
    }
  };

  const { isOver, setNodeRef } = useDroppable({
    id: hour,
  });

  return (
    <HStack
      ref={setNodeRef}
      w="100%"
      bg={isPassedBg}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      spacing={4}
      alignItems="center"
      borderColor="grey.100"
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <Text fontSize="md" fontWeight="medium">
          {hour}
        </Text>
      </Box>
      <Box flex="1">
        <VStack align="start">
          {tasks.map((task) => (
            <TaskItem key={task.id} id={task.id} task={task} removeTask={removeTask} />
          ))}
          {isAddingTask && (
            <Textarea
              ref={textareaRef}
              placeholder="Add task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              resize="none"
              height="20px"
              minHeight="20px"
              overflowY="hidden"
            />
          )}
        </VStack>
      </Box>
      {!isAddingTask && (
        <IconButton
          aria-label="Add task"
          icon={<MdAdd />}
          size="sm"
          borderRadius="md"
          onClick={() => setIsAddingTask(true)}
        />
      )}
    </HStack>
  );
};

export default HourBlock;