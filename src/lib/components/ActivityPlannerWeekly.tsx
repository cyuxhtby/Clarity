import React, { useState, useEffect } from 'react';
import { VStack, useColorModeValue, Box, Text, IconButton } from '@chakra-ui/react';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import { format, addDays, startOfTomorrow } from 'date-fns';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import HourBlock from './HourBlock';

interface Activity {
  text: string;
  tasks: Task[];
}

interface Activities {
  [key: string]: Activity;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

const ActivityPlannerWeekly: React.FC = () => {
  const [activities, setActivities] = useState<Activities>({});
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const bg = useColorModeValue('gray.50', 'gray.700');

  const fetchActivities = async () => {
    if (!user) return;

    try {
      console.log('Fetching activities for user:', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      const activitiesCollectionRef = collection(userDocRef, 'activities');
      const activitiesSnapshot = await getDocs(activitiesCollectionRef);
      const activitiesData: Activities = {};
      activitiesSnapshot.forEach((docSnapshot) => {
        activitiesData[docSnapshot.id] = docSnapshot.data() as Activity;
      });
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const toggleExpandDay = (dayKey: string) => {
    setExpandedDays((prevState) => ({
      ...prevState,
      [dayKey]: !prevState[dayKey],
    }));
  };

  const saveActivity = async (key: string, activityText: string) => {
    if (!user || activityText.trim() === '') {
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const activityDocRef = doc(collection(userDocRef, 'activities'), key);

    try {
      await setDoc(activityDocRef, { text: activityText, tasks: activities[key]?.tasks || [] });
      setActivities((prevActivities) => ({
        ...prevActivities,
        [key]: { text: activityText, tasks: activities[key]?.tasks || [] },
      }));
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const deleteActivity = async (key: string) => {
    if (!user) {
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const activityDocRef = doc(collection(userDocRef, 'activities'), key);

    try {
      await deleteDoc(activityDocRef);
      setActivities((prevActivities) => {
        const updatedActivities = { ...prevActivities };
        delete updatedActivities[key];
        return updatedActivities;
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const addTask = async (key: string, taskText: string) => {
    if (!user || taskText.trim() === '') {
      return;
    }

    const newTask: Task = {
      id: `${key}_${Date.now()}`,
      title: taskText,
      completed: false,
      order: activities[key]?.tasks?.length || 0,
    };

    const userDocRef = doc(db, 'users', user.uid);
    const activityDocRef = doc(collection(userDocRef, 'activities'), key);

    try {
      await setDoc(activityDocRef, {
        text: activities[key]?.text || '',
        tasks: [...(activities[key]?.tasks || []), newTask],
      });
      setActivities((prevActivities) => ({
        ...prevActivities,
        [key]: {
          text: prevActivities[key]?.text || '',
          tasks: [...(prevActivities[key]?.tasks || []), newTask],
        },
      }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const removeTask = async (key: string, task: Task) => {
    if (!user) {
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const activityDocRef = doc(collection(userDocRef, 'activities'), key);

    try {
      await setDoc(activityDocRef, {
        text: activities[key]?.text || '',
        tasks: activities[key]?.tasks?.filter((t) => t.id !== task.id) || [],
      });
      setActivities((prevActivities) => ({
        ...prevActivities,
        [key]: {
          text: prevActivities[key]?.text || '',
          tasks: prevActivities[key]?.tasks?.filter((t) => t.id !== task.id) || [],
        },
      }));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfTomorrow(), i));

  return (
    <VStack width="full" borderRadius="md" spacing={4} zIndex={20} position="relative" p={4}>
      {days.map((day, dayIndex) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayActivities = Object.keys(activities)
          .filter((key) => key.startsWith(dayKey))
          .map((key) => ({ time: key.split('_')[1], ...activities[key] }));

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
                const activity = activities[key];
                return (
                  <Box mb={2} key={`${dayIndex}_${hourIndex}`}>
                    <HourBlock
                      hour={key}
                      tasks={activity?.tasks || []}
                      addTask={(taskText) => addTask(key, taskText)}
                      removeTask={(task) => removeTask(key, task)}
                      isFutureDate={true}
                    />
                  </Box>
                );
              })
            ) : dayActivities.length > 0 ? (
              dayActivities.map((activity, index) => (
                <Box key={index} p={2} borderWidth="1px" borderRadius="md" mt={2}>
                  <Text>{activity.time}</Text>
                  <Text>{activity.text}</Text>
                </Box>
              ))
            ) : (
              <Text mt={2} color="gray.500">
                No tasks scheduled
              </Text>
            )}
          </Box>
        );
      })}
      <Box height={10} />
    </VStack>
  );
};

export default ActivityPlannerWeekly;