import React, { useState, useEffect } from 'react';
import { VStack, useColorModeValue, Box, Text, IconButton, Flex } from '@chakra-ui/react';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import { format, addDays, startOfTomorrow } from 'date-fns';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import HourBlock from './HourBlock';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  date?: string;
  hour?: string;
}

const WeeklyPlanner: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const bg = useColorModeValue('gray.50', 'gray.700');

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      onSnapshot(tasksRef, (snapshot) => {
        const tasksData: Task[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const toggleExpandDay = (dayKey: string) => {
    setExpandedDays((prevState) => ({
      ...prevState,
      [dayKey]: !prevState[dayKey],
    }));
  };

  const addTask = async (key: string, taskText: string) => {
    if (!user || taskText.trim() === '') return;
    console.log("task text", taskText);
    console.log("key", key);


    const [date, hour] = key.split('_');
    const newTask: Task = {
      id: `${key}_${Date.now()}`,
      title: taskText,
      completed: false,
      order: tasks.filter(task => task.date === date && task.hour === hour).length,
      date,
      hour,
    };

    const taskDocRef = doc(db, 'users', user.uid, 'tasks', newTask.id);

    setTasks((prevTasks) => [...prevTasks, newTask]);

    try {
      await setDoc(taskDocRef, newTask);
      console.log("new task", newTask);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const removeTask = async (task: Task) => {
    if (!user) return;

    const taskDocRef = doc(db, 'users', user.uid, 'tasks', task.id);

    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));

    try {
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const assignTaskTime = async (taskId: string, date: string, hour: string) => {
    if (!user) return;

    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].date = date;
        updatedTasks[taskIndex].hour = hour;
      }
      return updatedTasks;
    });

    try {
      await updateDoc(taskDocRef, { date, hour });
    } catch (error) {
      console.error('Error assigning task time:', error);
    }
  };

  const handleDropTask = async (taskId: string, destinationHour: string) => {
    if (!user) return;

    const [destinationDate, hour] = destinationHour.split('_');

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].hour = hour;
        updatedTasks[taskIndex].date = destinationDate;
      }
      return updatedTasks;
    });

    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskDocRef, { date: destinationDate, hour });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleDropTask(active.id as string, over.id as string);
    }
  };

  const hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfTomorrow(), i));



  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <VStack width="full" borderRadius="md" spacing={4} zIndex={20} position="relative" p={4}>
          {days.map((day, dayIndex) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const isExpanded = expandedDays[dayKey];

            return (
              <Box key={dayIndex} width="full" mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Text fontSize="lg" fontWeight="bold" mt={4} mb={2}>
                    {format(day, 'EEEE MMMM d')}
                  </Text>
                  <IconButton
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    icon={isExpanded ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
                    onClick={() => toggleExpandDay(dayKey)}
                    size="sm"
                  />
                </Box>
                {isExpanded ? (
                  hours.map((hour, hourIndex) => {
                    const key = `${dayKey}_${hour}`;
                    const tasksForHour = tasks.filter(task => task.date === dayKey && task.hour === hour);
                    return (
                      <Box mb={2} key={`${dayIndex}_${hourIndex}`}>
                        <HourBlock
                          hour={hour}
                          tasks={tasksForHour}
                          addTask={(taskText) => {
                            const key = `${dayKey}_${hour}`;
                            addTask(key, taskText);
                          }}
                          removeTask={removeTask}
                          assignTaskTime={assignTaskTime}
                        />
                      </Box>
                    );
                  })
                ) : (
                  <Box>
                    {tasks.filter(task => task.date === dayKey).map(task => (
                      <Box mb={1}>
                        <TaskItem key={task.id} id={task.id} task={task} removeTask={removeTask} noGrabber />
                      </Box>
                    ))}
                    {tasks.filter(task => task.date === dayKey).length === 0 && (
                      <Text mt={2} color="gray.500">
                        No tasks scheduled
                      </Text>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
          <Box height={10} />
        </VStack>
      </SortableContext>
    </DndContext>
  );
};

export default WeeklyPlanner;
