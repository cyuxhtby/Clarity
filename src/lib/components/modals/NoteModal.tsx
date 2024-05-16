import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Link,
  useColorModeValue
} from '@chakra-ui/react';

interface Note {
    text: string;
    link?: string;
    imageUrl?: string;
  }

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, note }) => {

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="lg" fontWeight="bold" mb={4} colorScheme=''>
            {note.text}
          </Text>
          {note.link && (
            <Link href={note.link} isExternal color="teal.500" mb={4}>
              {note.link}
            </Link>
          )}
          {note.imageUrl && (
            <Image
              src={note.imageUrl}
              alt="Note Image"
              objectFit="cover"
              borderRadius="md"
              mb={4}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NoteModal;