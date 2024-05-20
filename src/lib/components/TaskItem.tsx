import React, { useState } from 'react';
import { Flex, Box, Checkbox, Text, IconButton, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { GoGrabber } from 'react-icons/go';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AssignTaskModal from '~/lib/components/modals/AssignTask';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  date?: string;
  hour?: string;
}

interface TaskItemProps {
  id: string;
  task: Task;
  removeTask: (task: Task) => void;
  assignTaskTime?: (taskId: string, date: string, hour: string) => void;
  noGrabber?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ id, task, removeTask, assignTaskTime, noGrabber = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handlePressStart = () => {
    const timer = window.setTimeout(() => {
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

  const handleAssignTime = (date: string, hour: string) => {
    if (assignTaskTime) {
      assignTaskTime(task.id, date, hour);
    }
  };

  return (
    <>
      <Box
        ref={setNodeRef}
        style={style}
        {...attributes}
        width="100%"
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
      >
        <Flex justify="center" width="100%">
          <Box width="400px" borderWidth="1px" borderRadius="lg" padding="2" paddingLeft="12px" paddingRight="8px">
            <Flex alignItems="center" justifyContent="space-between">
              <Flex alignItems="center" flex="1">
                <Checkbox
                  size="lg"
                  isChecked={task.completed}
                  onChange={() => removeTask(task)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    '.chakra-checkbox__control': {
                      borderColor: useColorModeValue('black', 'white'),
                      _checked: {
                        bg: useColorModeValue('black', 'white'),
                        borderColor: useColorModeValue('black', 'white'),
                        color: useColorModeValue('white', 'black'),
                      },
                      _hover: {
                        bg: useColorModeValue('blackAlpha.400', 'whiteAlpha.400'),
                      },
                    },
                  }}
                />
                <Text ml={2} color={useColorModeValue('black', 'white')}>
                  {task.title}
                </Text>
              </Flex>
              {!noGrabber ? (
                <IconButton
                  aria-label="Drag task"
                  icon={<GoGrabber />}
                  size="sm"
                  variant="ghost"
                  cursor="grab"
                  {...listeners}
                />
              ) : (
                <Text ml={2} color={useColorModeValue('gray.500', 'gray.300')}>
                  {task.hour}
                </Text>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>
      <AssignTaskModal isOpen={isOpen} onClose={onClose} onAssign={handleAssignTime} />
    </>
  );
};

export default TaskItem;
