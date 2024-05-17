import React from 'react';
import { Flex, Box, Checkbox, Text, IconButton, useColorModeValue } from '@chakra-ui/react';
import { GoGrabber } from 'react-icons/go';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface TaskItemProps {
  id: string;
  task: Task;
  removeTask: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ id, task, removeTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} width="100%">
      <Flex justify="center" width="100%">
        <Box width="400px" borderWidth="1px" borderRadius="lg" padding="2" paddingLeft="12px" paddingRight="8px">
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center">
              <Checkbox
                size="lg"
                isChecked={task.completed}
                onChange={() => removeTask(task)}
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
            <IconButton
              aria-label="Drag task"
              icon={<GoGrabber />}
              size="sm"
              variant="ghost"
              cursor="grab"
              {...listeners}
            />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default TaskItem;
