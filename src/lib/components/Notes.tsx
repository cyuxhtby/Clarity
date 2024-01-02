import React, { useEffect, useState } from 'react';
import { VStack, Text, Box, useColorModeValue, useDisclosure, Link } from '@chakra-ui/react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import DeleteItem from '~/lib/components/modals/DeleteItem';

interface Note {
  id: string;
  text: string;
  link?: string; 
  createdAt: any; 
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<number | null>(null); 

  useEffect(() => {
    if (!user) {
      console.log("User not logged in");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const notesCollectionRef = collection(userDocRef, "notes");
    const unsubscribe = onSnapshot(notesCollectionRef, (querySnapshot) => {
      const notesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        link: doc.data().link,
        createdAt: doc.data().createdAt,
      }));
      const sortedNotesData = notesData.sort((a, b) => a.createdAt - b.createdAt)
      setNotes(sortedNotesData);
    });

    return () => unsubscribe();
    const sortedNotes = notes 
  }, [user]);

  const bg = useColorModeValue('gray.50', 'gray.800'); 
  const color = useColorModeValue('gray.900', 'white'); 
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handlePressStart = (noteId: string) => {
    const timer = window.setTimeout(() => { 
      setSelectedNoteId(noteId);
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

  const handleDeleteNote = async () => {
    if (selectedNoteId && user) {
      const noteDocRef = doc(db, "users", user.uid, "notes", selectedNoteId);
      try {
        await deleteDoc(noteDocRef);
      } catch (error) {
        console.error("Error deleting note: ", error);
      }
      setSelectedNoteId(null);
      onClose();
    }
  };

  return (
    <VStack spacing={4} align="stretch" position="relative" zIndex={20} w="full">
      {notes.length > 0 ? (
        notes.map((note) => (
          <Box
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
          >
            <Text  fontSize={{ base: "md", md: "lg" }} fontWeight={"bold"}>
                {note.text}
            </Text>
            {note.link && (
              <Link href={note.link} isExternal color="teal.500">
                {note.link}
            </Link>
            )}
          </Box>
        ))
      ) : (
        <Text fontSize="lg" fontWeight="bold">Your notes will show here</Text>
      )}

      <DeleteItem
        isOpen={isOpen}
        onConfirm={handleDeleteNote}
        onCancel={() => {
          setSelectedNoteId(null);
          onClose();
        }}
      />
    </VStack>
  );
};

export default Notes;