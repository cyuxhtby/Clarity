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
  Icon,
  Box
} from '@chakra-ui/react';
import { FaPlus } from "react-icons/fa6";
import { collection, addDoc, doc, Timestamp} from "firebase/firestore";
import { firestore as db} from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

const AddTask: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [taskName, setTaskName] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'); 
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)'); 
  const colorScheme = useColorModeValue('blue', 'blue'); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      console.error("A task is required");
      return;
    }
    if (!user) {
      console.error("User must be logged in to add tasks");
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      const taskCollectionRef = collection(userDocRef, "tasks");
      const taskDoc = { title: taskName, completed: false };
      const docRef = await addDoc(taskCollectionRef, taskDoc);
      setTaskName('');
      setTaskLink('');
      onClose();
      toast({ title: "Task added", status: "success", duration: 1000 });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  

  return (
    <>
    <Button onClick={onOpen} colorScheme={colorScheme} size="md" height="45px" >
        Add Task
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
          <ModalHeader>New task</ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <Input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
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

export default AddTask;
