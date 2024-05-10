import React, { useEffect, useState } from 'react';
import { VStack, Text, Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import DeleteItem from '~/lib/components/modals/DeleteItem';

interface Log {
  id: string;
  text: string;
  dateTime: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      console.log("User not logged in");
      return;
    }
    console.log("User authenticated:", user);
  
    const userDocRef = doc(db, "users", user.uid);
    const logsCollectionRef = collection(userDocRef, "logs");
  
    const unsubscribe = onSnapshot(logsCollectionRef, (querySnapshot) => {
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        dateTime: doc.data().dateTime,
      }));
      console.log("Fetched logs data:", logsData);
  
      const sortedLogsData = logsData.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
      setLogs(sortedLogsData);
    });
  
    return () => unsubscribe();
  }, [user]);

  const bg = useColorModeValue('gray.50', 'gray.800');
  const color = useColorModeValue('gray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handlePressStart = (logId: string) => {
    const timer = window.setTimeout(() => {
      setSelectedLogId(logId);
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

  const handleDeleteLog = async () => {
    if (selectedLogId && user) {
      const logDocRef = doc(db, "users", user.uid, "logs", selectedLogId);
      try {
        await deleteDoc(logDocRef);
      } catch (error) {
        console.error("Error deleting log: ", error);
      }
      setSelectedLogId(null);
      onClose();
    }
  };

  return (
    <VStack spacing={4}  position="relative" zIndex={20} w="full" justifyContent="center">
      {logs.length > 0 ? (
        logs.map((log) => (
          <Box
            key={log.id}
            p={4}
            bg={bg}
            color={color}
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ boxShadow: 'md' }}
            onPointerDown={() => handlePressStart(log.id)}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            wordBreak="break-word"
            userSelect="none"
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight={'bold'} mb={2}>
              {log.dateTime}
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }}>
              {log.text}
            </Text>
          </Box>
        ))
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
          <Text fontSize="lg" fontWeight="bold">
            Your logs will show here
          </Text>
        </Box>
      )}
      <DeleteItem
        isOpen={isOpen}
        onConfirm={handleDeleteLog}
        onCancel={() => {
          setSelectedLogId(null);
          onClose();
        }}
      />
    </VStack>
  );
};

export default Logs;