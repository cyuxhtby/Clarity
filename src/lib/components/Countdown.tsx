'use client'

import React, { useEffect, useState } from 'react';
import { VStack, Text, Box, useColorModeValue} from '@chakra-ui/react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { Timestamp, QuerySnapshot, DocumentData  } from 'firebase/firestore';

interface Item {
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
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const itemsData: Item[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name as string,
        dueDate: doc.data().dueDate as Timestamp,
      }));
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(currentItems => {
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
  
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
  
    return timeLeft;
  };
  
  const bg = useColorModeValue('gray.50', 'gray.800'); 
  const color = useColorModeValue('gray.900', 'white'); 
  const borderColor = useColorModeValue('gray.200', 'gray.700'); 

  return (
    <VStack spacing={4} align="stretch">
      {items.map((item) => {
        const timeLeft = calculateTimeLeft(item.dueDate);
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
          >
            <Text fontSize="lg" fontWeight="bold" mb={1}>
              {item.name}
            </Text>
            
            {Object.keys(timeLeft).length > 0 && (
              <Text fontSize="md">
                Time left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </Text>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

export default Countdown;
