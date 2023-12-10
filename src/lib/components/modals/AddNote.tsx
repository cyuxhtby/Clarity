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
  Textarea,
  useDisclosure,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaLink } from "react-icons/fa";
import { collection, addDoc, doc, Timestamp } from "firebase/firestore";
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

const AddNote = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteText, setNoteText] = useState('');
  const [link, setLink] = useState('');
  const { user } = useAuth();

  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)');
  const colorScheme = useColorModeValue('blue', 'blue');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!noteText.trim()) {
      console.error("Enter note");
      return;
    }
    if (!user) {
      console.error("User must be logged in to add notes");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid); 
      const notesCollectionRef = collection(userDocRef, "notes"); 
      const noteDoc = {
        text: noteText,
        link: link.trim(), 
        createdAt: Timestamp.fromDate(new Date()),
      };

      await addDoc(notesCollectionRef, noteDoc);

      setNoteText('');
      setLink(''); 
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme={colorScheme} size="lg">
        Add Note
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
          <ModalHeader>Lets save this for later</ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  size="lg"
                  minHeight="100px"
                />
                <InputGroup mt={4}>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<FaLink color="gray" />}
                  />
                  <Input 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </InputGroup>
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

export default AddNote;
