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

const AddItem = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemName, setItemName] = useState('');
  const [itemDate, setItemDate] = useState('');

  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'); 
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)'); 
  const colorScheme = useColorModeValue('blue', 'blue'); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim() || !itemDate.trim()) {
      console.error("Item name and date are required");
      return;
    }
  
    try {
      const itemsCollectionRef = collection(db, "items");
      
      const itemDateTimestamp = Timestamp.fromDate(new Date(itemDate + "T00:00:00")); 
      const docRef = await addDoc(itemsCollectionRef, {
        name: itemName,
        dueDate: itemDateTimestamp,
        createdAt: Timestamp.fromDate(new Date()),
      });
  
      console.log("Document written with ID: ", docRef.id);
      setItemName('');
      setItemDate('');
      onClose(); // Close the after submission
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
          <ModalHeader>Add something bby</ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>You want to</FormLabel>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>By when</FormLabel>
                <Input
                  type="date"
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
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
