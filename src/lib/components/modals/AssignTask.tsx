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
  Select,
  useColorModeValue,
  FormLabel,
  Input
} from '@chakra-ui/react';

interface AssignTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (date: string, hour: string) => void;
}

const AssignTask: React.FC<AssignTaskProps> = ({ isOpen, onClose, onAssign }) => {
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const backdropFilter = useColorModeValue('blur(10px)', 'blur(15px)');
  const colorScheme = useColorModeValue('blue', 'blue');

  const handleAssign = () => {
    if (selectedHour && selectedDate) {
      onAssign(selectedDate, selectedHour);
      onClose();
    }
  };

  const hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);

  return (
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
        alignItems="center"
      >
        <ModalHeader>Assign a Time</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input type="date" onChange={(e) => setSelectedDate(e.target.value)} />
            <FormLabel>Time</FormLabel>
            <Select placeholder="Select time" onChange={(e) => setSelectedHour(e.target.value)}>
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme={colorScheme} onClick={handleAssign}>
            Assign
          </Button>
          <Button onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AssignTask;
