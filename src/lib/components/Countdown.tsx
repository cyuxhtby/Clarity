'use client'

import React, { useEffect, useState } from 'react';
import { VStack, Text, Box, useColorModeValue, useDisclosure} from '@chakra-ui/react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { Timestamp, QuerySnapshot, DocumentData, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '~/lib/contexts/AuthContext';
import DeleteItem from '~/lib/components/modals/DeleteItem';


interface Event {
  id: string;
  name: string;
  dueDate: Timestamp;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }
  

const Countdown = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<number | null>(null); 

  useEffect(() => {
    if (!user) {
      console.log("User not logged in");
      return;
    }
  
    const userDocRef = doc(db, "users", user.uid);
    const eventsCollectionRef = collection(userDocRef, "events");
    const q = eventsCollectionRef; 
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let eventsData = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name,
          dueDate: docData.dueDate,
        };
      });
      
      eventsData.sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate());
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, [user]);  


  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(currentItems => {
        return currentItems.map(item => {
          return { ...item }; // Trigger re-render by creating a new object
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (dueDate: Timestamp): TimeLeft => {
    const now = new Date();
    const targetDate = dueDate.toDate();
    const difference = targetDate.getTime() - now.getTime();
  
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return {
        days: Math.floor(-difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((-difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((-difference / 1000 / 60) % 60),
        seconds: Math.floor((-difference / 1000) % 60),
      };
    }
  };
  
  const bg = useColorModeValue('gray.50', 'gray.800'); 
  const color = useColorModeValue('gray.900', 'white'); 
  const borderColor = useColorModeValue('gray.200', 'gray.700'); 

  const handlePressStart = (itemId: string) => {
    const timer = window.setTimeout(() => { 
      setSelectedItemId(itemId);
      onOpen();
    }, 800) as number; 
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer !== null) {
      clearTimeout(pressTimer); 
      setPressTimer(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedItemId && user) {
      const eventDocRef = doc(db, "users", user.uid, "events", selectedItemId);
      try {
        await deleteDoc(eventDocRef);
      } catch (error) {
        console.error("Error deleting event: ", error);
      }
      setSelectedItemId(null);
      onClose();
    }
  };
  
 
  return (
    <VStack spacing={4} align="stretch" position="relative" zIndex={20} minHeight="400px" alignItems="center" justifyContent="center">
      {events.length > 0 ? (
        events.map((item) => {
          const timeLeft = calculateTimeLeft(item.dueDate);
          const isOverdue = new Date(item.dueDate.toDate()).getTime() < new Date().getTime();
          return (
            <Box
              key={item.id}
              p={4}
              bg={bg}
              color={color}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
              _hover={{ boxShadow: 'md' }}
              onPointerDown={() => handlePressStart(item.id)} 
              onPointerUp={handlePressEnd} 
              onPointerLeave={handlePressEnd}
              userSelect="none"
            >
              <Text fontSize="lg" fontWeight="bold" mb={1}>
                {item.name}
              </Text>
              {isOverdue ? (
                <>
                <Text fontSize="md" display="inline">
                   Time elapsed: 
                </Text>
                <Text fontSize="md" display="inline" color={"red.500"}>
                  {` ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                </Text>
              </>
              ) : (
                <Text fontSize="md">
                  Time left: {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                </Text>
              )}
            </Box>
          );
        })
      ) : (
        <Text fontSize="lg" fontWeight="bold">Your events will show here</Text>
      )}

      
      <DeleteItem
    isOpen={isOpen}
    onConfirm={handleDeleteConfirm}
    onCancel={() => {
      setSelectedItemId(null);
      onClose();
    }}
  />
    </VStack>
  );
};

export default Countdown;
