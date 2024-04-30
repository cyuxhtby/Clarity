import React, { useState, useEffect, useRef } from 'react';
import { VStack, Checkbox, Button, Input, useToast, Flex, Box, useColorModeValue, Text} from '@chakra-ui/react';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import AddTask from './modals/AddTask';
import { color } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const Checklist = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const checklistRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const toast = useToast();
  // const bg = useColorModeValue('gray.50', 'blackAlpha.500');


  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    const adjustChecklistHeight = () => {
      if (checklistRef.current) {
        checklistRef.current.style.minHeight = '0px';
        checklistRef.current.style.minHeight = `${checklistRef.current.scrollHeight}px`;
      }
    };
    adjustChecklistHeight();
  }, [tasks]);

  const fetchTasks = async () => {
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const querySnapshot = await getDocs(tasksRef);
    const tasksData = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Task)
      .sort((a, b) => a.title.length - b.title.length);
    setTasks(tasksData);
  };

  const removeTask = async (task: Task) => {
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', task.id);
    await updateDoc(taskDocRef, { completed: true });
    await deleteDoc(taskDocRef);
    setTasks((prevTasks) => prevTasks.filter((prevTask) => prevTask.id !== task.id));

    const toastId = toast({
      title: 'Task removed',
      status: 'success',
      duration: 3000,
      render: () => (
        <Box color="white" p={3} bg="green.500"  borderRadius="lg" display="flex" alignItems="center">
          Task removed
          <Button
            borderRadius="lg"
            size="sm"
            ml={4}
            onClick={async () => {
              await setDoc(doc(db, 'users', user.uid, 'tasks', task.id), {
                title: task.title,
                completed: false,
              });
              fetchTasks();
              toast.close(toastId);
            }}
          >
            Undo
          </Button>
        </Box>
      ),
    });
  };

  return (
    <VStack
      ref={checklistRef}
      align="stretch"
      spacing={4}
      width="100%"
      overflowY="auto"
      minHeight={400}
      justifyContent="center"
      zIndex={20}
    >
      {tasks.map((task) => (
        <Flex key={task.id} justify="center" width="100%">
          <Box width="400px" borderWidth="1px" borderRadius="lg" padding="2" paddingLeft="12px" paddingRight="8px">
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
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};

export default Checklist;