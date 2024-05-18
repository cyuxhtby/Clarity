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
}

const ActivityPlanner: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const activitiesCollectionRef = collection(userDocRef, 'activities');
        const activitiesSnapshot = await getDocs(activitiesCollectionRef);
        const activitiesData: Record<string, Task[]> = {};
        activitiesSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          activitiesData[docSnapshot.id] = data.tasks;
        });
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [user]);

  const addTask = async (hour: string, taskText: string) => {
    if (!user) return;

    const newTask: Task = { id: `${hour}_${Date.now()}`, title: taskText, completed: false, order: 0 };
    const userDocRef = doc(db, 'users', user.uid);
    const activitiesCollectionRef = collection(userDocRef, 'activities');
    const activityDocRef = doc(activitiesCollectionRef, hour);

    setActivities((prevActivities) => ({
      ...prevActivities,
      [hour]: [...(prevActivities[hour] || []), newTask],
    }));

    try {
      const updatedTasks = [...(activities[hour] || []), newTask];
      await setDoc(activityDocRef, { tasks: updatedTasks });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const removeTask = async (task: Task) => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const activitiesCollectionRef = collection(userDocRef, 'activities');

    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      Object.keys(updatedActivities).forEach((hour) => {
        if (updatedActivities[hour]) {
          updatedActivities[hour] = updatedActivities[hour].filter((t) => t.id !== task.id);
        }
      });
      return updatedActivities;
    });

    try {
      const hour = task.id.split('_')[0];
      const updatedTasks = activities[hour]?.filter((t) => t.id !== task.id) || [];
      const activityDocRef = doc(activitiesCollectionRef, hour);
      await setDoc(activityDocRef, { tasks: updatedTasks });
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const handleDropTask = async (taskId: string, destinationHour: string) => {
    if (!user) return;

    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
      let movedTask: Task | undefined;

      Object.keys(updatedActivities).forEach((key) => {
        if (updatedActivities[key]) {
          const taskIndex = updatedActivities[key].findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            [movedTask] = updatedActivities[key].splice(taskIndex, 1);
          }
        }
      });

      if (movedTask) {
        if (!updatedActivities[destinationHour]) {
          updatedActivities[destinationHour] = [];
        }
        updatedActivities[destinationHour].push(movedTask);
      }

      return updatedActivities;
    });

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const activitiesCollectionRef = collection(userDocRef, 'activities');
      let updatedTasks: Task[];

      Object.keys(activities).forEach(async (hour) => {
        if (hour === destinationHour) {
          updatedTasks = [...activities[hour].filter((task) => task.id !== taskId), activities[taskId.split('_')[0]]?.find((task) => task.id === taskId)].filter((task) => task !== undefined) as Task[];
        } else {
          updatedTasks = activities[hour]?.filter((task) => task.id !== taskId) || [];
        }
        const activityDocRef = doc(activitiesCollectionRef, hour);
        await setDoc(activityDocRef, { tasks: updatedTasks });
      });
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
              tasks={activities[hour] || []}
              addTask={addTask}
              removeTask={removeTask}
            />
          ))}
          <Box height={10} />
        </VStack>
      </DndContext>
    </>
  );
};

export default ActivityPlanner;
