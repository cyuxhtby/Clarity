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
  useColorModeValue
} from '@chakra-ui/react';
import { collection, addDoc, Timestamp} from "firebase/firestore";
import { firestore as db} from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

const AddItem = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemName, setItemName] = useState('');
  const [itemDateTime, setItemDateTime] = useState('');
  const { user } = useAuth();

  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'); 
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)'); 
  const colorScheme = useColorModeValue('blue', 'blue'); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim() || !itemDateTime.trim()) {
      console.error("Item name and date are required");
      return;
    }
    if (!user) {
      console.error("User must be logged in to add items");
      return;
    }
  
    try {
      const itemsCollectionRef = collection(db, "items");
    
      const itemDateTimestamp = Timestamp.fromDate(new Date(itemDateTime)); 
      const docRef = await addDoc(itemsCollectionRef, {
        userId: user.uid, 
        name: itemName,
        dueDate: itemDateTimestamp,
        createdAt: Timestamp.fromDate(new Date()),
      });
  
      setItemName('');
      setItemDateTime('');
      onClose(); 
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  

  return (
    <>
      <Button onClick={onOpen} colorScheme={colorScheme} size="lg">
        Add Item
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={bg}
          backdropFilter={backdropFilter}
          borderRadius="xl"
          mx={4}
          my={20}
          p={6}
          boxShadow="xl"
        >
          <ModalHeader>What do you want to do?</ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>I want to</FormLabel>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>By when?</FormLabel>
                <Input
                  type="datetime-local"
                  value={itemDateTime}
                  onChange={(e) => setItemDateTime(e.target.value)}
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

export default AddItem;
