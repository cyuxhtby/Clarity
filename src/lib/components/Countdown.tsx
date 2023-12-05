'use client'

import React, { useEffect, useState } from 'react';
import { VStack, Text, Box, useColorModeValue, useDisclosure} from '@chakra-ui/react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { Timestamp, QuerySnapshot, DocumentData, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '~/lib/contexts/AuthContext';
import  DeleteItem from '~/lib/components/modals/DeleteItem'


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
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<number | null>(null); 

  useEffect(() => {
    if (!user) {
      // Handle the case where the user is not logged in
      console.log("User not logged in");
      return;
    }

    // Only query items that belong to the logged-in user
    const q = query(collection(db, "items"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const itemsData: Item[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name as string,
        dueDate: doc.data().dueDate as Timestamp,
      }));
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, [user]);

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
    if (selectedItemId) {
      await deleteDoc(doc(db, "items", selectedItemId));
      setSelectedItemId(null);
      onClose(); 
    }
  };
 
  return (
    <VStack spacing={4} align="stretch">
      {items.length > 0 ? (
        items.map((item) => {
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
              onPointerDown={() => handlePressStart(item.id)} 
              onPointerUp={handlePressEnd} 
              onPointerLeave={handlePressEnd} 
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
        })
      ) : (
        <Text fontSize="lg" fontWeight="bold">Your items will show here</Text>
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
