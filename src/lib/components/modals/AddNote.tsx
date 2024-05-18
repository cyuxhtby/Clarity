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
  useToast,
  Image,
  Box,
} from '@chakra-ui/react';
import { FaLink, FaCamera } from 'react-icons/fa';
import { collection, addDoc, doc, Timestamp } from 'firebase/firestore';
import { firestore as db, storage } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddNote = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteText, setNoteText] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)'
  );
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)');
  const colorScheme = useColorModeValue('blue', 'blue');

  const isMobilePWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.addEventListener('change', handleImageUpload);
    input.click();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!noteText.trim()) {
      console.error('Enter note');
      return;
    }
    if (!user) {
      console.error('User must be logged in to add notes');
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const notesCollectionRef = collection(userDocRef, 'notes');
      const noteDoc: {
        text: string;
        link: string;
        createdAt: Timestamp;
        imageUrl?: string;
      } = {
        text: noteText,
        link: link.trim(),
        createdAt: Timestamp.fromDate(new Date()),
      };

      if (image) {
        const storageRef = ref(storage, `notes/${user.uid}/${Date.now()}`);
        await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(storageRef);
        noteDoc.imageUrl = imageUrl;
      }

      await addDoc(notesCollectionRef, noteDoc);
      setNoteText('');
      setLink('');
      setImage(null);
      setImagePreview('');
      onClose();
      toast({
        title: 'Note added',
        status: 'success',
        duration: 1000,
      });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme={colorScheme}
        size="md"
        height="45px"
      >
        Add Note
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={bg}
          backdropFilter={backdropFilter}
          borderRadius="xl"
          mx={4}
          my={36}
          p={6}
          boxShadow="xl"
        >
          <ModalHeader>A note for later</ModalHeader>
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
                <InputGroup mt={4} display="flex" alignItems="center">
                  <InputLeftElement
                    pointerEvents="none"
                    children={<FaCamera color="gray" />}
                    onClick={isMobilePWA() ? handleImageCapture : undefined}
                    cursor={isMobilePWA() ? 'pointer' : 'default'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', 
                      height: '100%', 
                    }}
                  />
                  {isMobilePWA() ? (
                    <Box
                      position="relative"
                      height={imagePreview ? '60px' : '60px'}
                      width="100%"
                    >
                      <Input
                        placeholder="No file chosen"
                        value={image ? (image as File).name : ''}
                        readOnly
                        cursor="pointer"
                        onClick={handleImageCapture}
                        pl="2.5rem"
                        height="100%"
                      />
                      {imagePreview && (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                          position="absolute"
                          right="10px"
                          top="50%"
                          transform="translateY(-50%)"
                        />
                      )}
                    </Box>
                  ) : (
                    <>
                      <Input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                      <Box
                        position="relative"
                        height={imagePreview ? '60px' : '40px'}
                        width="100%"
                      >
                        <Input
                          placeholder="No file chosen"
                          value={image ? (image as File).name : ''}
                          readOnly
                          cursor="pointer"
                          onClick={() =>
                            document.getElementById('fileInput')?.click()
                          }
                          pl="2.5rem"
                          height="100%"
                        />
                        {imagePreview && (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            boxSize={isMobilePWA() ? '60px' : '50px'}
                            objectFit="cover"
                            borderRadius="md"
                            position="absolute"
                            right="10px"
                            top="50%"
                            transform="translateY(-50%)"
                          />
                        )}
                      </Box>
                    </>
                  )}
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
