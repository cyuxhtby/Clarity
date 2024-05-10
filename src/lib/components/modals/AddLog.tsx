import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  Textarea,
  useDisclosure,
  useColorModeValue,
  useToast,
  Box,
  Text,
} from '@chakra-ui/react';
import { collection, addDoc, doc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

const AddLog = ({ onlogAdded }: { onlogAdded?: () => void }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logText, setLogText] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)');
  const colorScheme = useColorModeValue('blue', 'blue');

  const [dateTimeString, setDateTimeString] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
      };
      const [weekday, date, time, timezone] = now.toLocaleString('en-US', options).split(', ');
      const formattedDateTime = `${weekday} ${date} ${time} ${timezone}`;
      setDateTimeString(formattedDateTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) {
      console.error('Log text is required');
      return;
    }
    if (!user) {
      console.error('User must be logged in to add logs');
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const logCollectionRef = collection(userDocRef, 'logs');
      const logDoc = {
        text: logText,
        dateTime: dateTimeString,
      };
      await addDoc(logCollectionRef, logDoc);
      setLogText('');
      onClose();
      toast({
        title: 'Log added',
        status: 'success',
        duration: 1000,
      });
      if (onlogAdded) {
        onlogAdded();
      }
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme={colorScheme} size="md" height="45px">
        Add Log
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bg} backdropFilter={backdropFilter} borderRadius="xl" mx={4} my={40} p={6} boxShadow="xl">
          <ModalHeader>
            <Box
              borderRadius="lg"
              p={4}
              textAlign="left"
              boxShadow="md"
            >
              <Text fontSize="lg" fontWeight="bold">
                {dateTimeString}
              </Text>
            </Box>
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <Textarea
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  minHeight="250px"
                  placeholder="Write your log here..."
                  borderRadius="md"
                  boxShadow="md"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Button colorScheme={colorScheme} type="submit" px={8}>
                Add
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddLog;