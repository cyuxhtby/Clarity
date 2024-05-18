import React, { useState, useEffect } from 'react';
import { VStack, Text, Box } from '@chakra-ui/react';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import HourBlock from './HourBlock';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  date?: string;
  hour?: string;
}

const DailyPlanner: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      try {
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        const tasksData: Task[] = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        console.log('Fetched tasks:', tasksData); // Debug: Log fetched tasks
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [user]);

  const addTask = async (hour: string, taskText: string) => {
    if (!user) return;

    const newTask: Task = { id: `${hour}_${Date.now()}`, title: taskText, completed: false, order: 0, date: new Date().toISOString().split('T')[0], hour };
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', newTask.id);

    setTasks((prevTasks) => [...prevTasks, newTask]);

    try {
      await setDoc(taskDocRef, newTask);
      console.log('Task added:', newTask); // Debug: Log added task
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
      console.log('Task removed:', task); // Debug: Log removed task
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
      console.log('Task time assigned:', taskId, date, hour); // Debug: Log assigned task time
    } catch (error) {
      console.error('Error assigning task time:', error);
    }
  };

  const handleDropTask = async (taskId: string, destinationHour: string) => {
    if (!user) return;

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].hour = destinationHour;
      }
      return updatedTasks;
    });

    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskDocRef, { hour: destinationHour });
      console.log('Task moved:', taskId, destinationHour); // Debug: Log moved task
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

  const today = new Date().toISOString().split('T')[0];
  const tasksForToday = tasks.filter(task => task.date === today);
  console.log('Tasks for today:', tasksForToday); // Debug: Log tasks for today

  return (
    <>
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Today
      </Text>
      <DndContext onDragEnd={handleDragEnd}>
        <VStack width="full" borderRadius="md" spacing={4} zIndex={20} position="relative">
          {hours.map((hour) => (
            <HourBlock
              key={hour}
              hour={hour}
              tasks={tasksForToday.filter(task => task.hour === hour).sort((a, b) => a.order - b.order)}
              addTask={addTask}
              removeTask={removeTask}
              assignTaskTime={assignTaskTime}
            />
          ))}
          <Box height={10} />
        </VStack>
      </DndContext>
    </>
  );
};

export default DailyPlanner;
