import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';

interface DeleteItemProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

const DeleteItem: React.FC<DeleteItemProps> = ({ isOpen, onConfirm, onCancel }) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)');
  const colorScheme = useColorModeValue('blue', 'blue');

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
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
        <ModalHeader alignContent="center">Done with this?</ModalHeader>
        <ModalFooter justifyContent="center">
          <Button colorScheme={colorScheme} px={5} mr={2} onClick={onConfirm}>
            Yes
          </Button>
          <Button onClick={onCancel} px={6} ml={2}>No</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteItem;
