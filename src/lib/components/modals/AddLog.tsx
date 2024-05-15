import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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

const AddLog = ({ onLogAdded }: { onLogAdded?: () => void }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logText, setLogText] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
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
      if (onLogAdded) {
        onLogAdded();
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
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent bg={bg} borderRadius="none" m={0} p={0} boxShadow="none">
          <ModalHeader p={4} borderBottomWidth={1} borderBottomColor="gray.200">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">
                {dateTimeString}
              </Text>
              <ModalCloseButton />
            </Box>
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody p={4}>
              <FormControl>
                <Textarea
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  minHeight="calc(100vh - 200px)"
                  placeholder="Write your log here..."
                  borderRadius="none"
                  boxShadow="none"
                  _focus={{ boxShadow: 'none' }}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter p={4} borderTopWidth={1} borderTopColor="gray.200">
              <Button colorScheme={colorScheme} type="submit" ml="auto">
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