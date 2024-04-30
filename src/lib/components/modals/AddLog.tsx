import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { collection, addDoc, doc, Timestamp } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

const AddLog = ({ onlogAdded }: { onlogAdded?: () => void }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logName, setlogName] = useState('');
  const [logLink, setlogLink] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  const bg = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)'
  );
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)');
  const colorScheme = useColorModeValue('blue', 'blue');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logName.trim()) {
      console.error('A log is required');
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
        title: logName,
        completed: false,
      };

      const docRef = await addDoc(logCollectionRef, logDoc);

      setlogName('');
      setlogLink('');
      onClose();

      toast({
        title: 'log added',
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
        <ModalContent
          bg={bg}
          backdropFilter={backdropFilter}
          borderRadius="xl"
          mx={4}
          my={40}
          p={6}
          boxShadow="xl"
        >
          <ModalHeader>New log</ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <Input
                  value={logName}
                  onChange={(e) => setlogName(e.target.value)}
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
