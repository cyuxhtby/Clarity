import React, { useEffect, useState } from 'react';
import {
  VStack,
  Text,
  Box,
  useColorModeValue,
  Link,
  Image,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import DeleteItem from '~/lib/components/modals/DeleteItem';
import NoteModal from '~/lib/components/modals/NoteModal';

interface Note {
  id: string;
  text: string;
  link?: string;
  imageUrl?: string;
  createdAt: any;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useAuth();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isNoteModalOpen,
    onOpen: onNoteModalOpen,
    onClose: onNoteModalClose,
  } = useDisclosure();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('User not logged in');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const notesCollectionRef = collection(userDocRef, 'notes');
    const unsubscribe = onSnapshot(notesCollectionRef, (querySnapshot) => {
      const notesData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          link: doc.data().link,
          imageUrl: doc.data().imageUrl,
          createdAt: doc.data().createdAt,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, [user]);

  const bg = useColorModeValue('gray.50', 'gray.800');
  const color = useColorModeValue('gray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleImageClick = (note: Note) => {
    setSelectedNote(note);
    onNoteModalOpen();
  };

  const handlePressStart = (noteId: string) => {
    const timer = setTimeout(() => {
      const note = notes.find((n) => n.id === noteId);
      if (note && !note.imageUrl) {
        setSelectedNote(note);
        onDeleteModalOpen();
      }
    }, 800);
    setPressTimer(timer as unknown as number);
  };

  const handlePressEnd = () => {
    if (pressTimer !== null) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleDeleteNote = async () => {
    if (selectedNote && user) {
      const noteDocRef = doc(db, 'users', user.uid, 'notes', selectedNote.id);
      try {
        await deleteDoc(noteDocRef);
        setSelectedNote(null);
        onDeleteModalClose();
      } catch (error) {
        console.error('Error deleting note: ', error);
      }
    }
  };

  return (
    <VStack
      spacing={4}
      align="stretch"
      position="relative"
      zIndex={20}
      w="full"
      minHeight={400}
      justifyContent="center"
    >
      {notes.length > 0 ? (
        notes.map((note) => (
          <Flex
            key={note.id}
            p={4}
            bg={bg}
            color={color}
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ boxShadow: 'md' }}
            onPointerDown={() => handlePressStart(note.id)}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            wordBreak="break-word"
            userSelect="none"
            align="center"
            justify="space-between"
          >
            <Box flex="1" mr={4}>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight={'bold'}>
                {note.text}
              </Text>
              {note.link && (
                <Link href={note.link} isExternal color="teal.500">
                  {note.link}
                </Link>
              )}
            </Box>
            {note.imageUrl && (
              <Image
                src={note.imageUrl}
                alt="Note Thumbnail"
                boxSize="60px"
                objectFit="cover"
                borderRadius="md"
                onClick={() => handleImageClick(note)}
                cursor="pointer"
              />
            )}
          </Flex>
        ))
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Text fontSize="lg" fontWeight="bold">
            Your notes will show here
          </Text>
        </Box>
      )}

      {selectedNote && (
        <>
          <DeleteItem
            isOpen={isDeleteModalOpen}
            onConfirm={handleDeleteNote}
            onCancel={() => {
              setSelectedNote(null);
              onDeleteModalClose();
            }}
          />
          <NoteModal
            isOpen={isNoteModalOpen}
            onClose={() => {
              setSelectedNote(null);
              onNoteModalClose();
            }}
            note={selectedNote}
          />
        </>
      )}
    </VStack>
  );
};

export default Notes;
