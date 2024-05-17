import React, { useState, useEffect } from 'react';
import {
  VStack,
  useColorModeValue,
  Box,
  Text,
  IconButton,
} from '@chakra-ui/react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import { format, addDays, startOfTomorrow } from 'date-fns';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import HourBlock from './HourBlock';

interface Activities {
  [key: string]: string;
}

const ActivityPlannerWeekly: React.FC = () => {
  const [activities, setActivities] = useState<Activities>({});
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );
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
        activitiesData[docSnapshot.id] = docSnapshot.data().text;
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
      await setDoc(activityDocRef, { text: activityText });
      setActivities((prevActivities) => ({
        ...prevActivities,
        [key]: activityText,
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

  const hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfTomorrow(), i)
  );

  return (
    <VStack
      width="full"
      borderRadius="md"
      spacing={4}
      zIndex={20}
      position="relative"
      p={4}
    >
      {days.map((day, dayIndex) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayActivities = Object.keys(activities)
          .filter((key) => key.startsWith(dayKey))
          .map((key) => ({ time: key.split('_')[1], text: activities[key] }));

        const isExpanded = expandedDays[dayKey];

        return (
          <Box key={dayIndex} width="full" mb={4}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize="lg" fontWeight="bold" mt={4} mb={2}>
                {format(day, 'EEEE MMMM d')}
              </Text>
              <IconButton
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                icon={
                  isExpanded ? <FaChevronCircleUp /> : <FaChevronCircleDown />
                }
                onClick={() => toggleExpandDay(dayKey)}
                size="sm"
              />
            </Box>
            {isExpanded ? (
              hours.map((hour, hourIndex) => {
                const key = `${dayKey}_${hour}`;
                return (
                    <Box mb={2}>
                    <HourBlock
                    key={`${dayIndex}_${hourIndex}`}
                    hour={key}
                    saveActivity={(hour, activity) =>
                      saveActivity(`${dayKey}_${hour}`, activity)
                    }
                    deleteActivity={(hour) =>
                      deleteActivity(`${dayKey}_${hour}`)
                    }
                    activity={activities[key]}
                    isFutureDate={true}
                  />
                  </Box>
                );
              })
            ) : dayActivities.length > 0 ? (
              dayActivities.map((activity, index) => (
                <Box
                  key={index}
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  mt={2}
                >
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
