import React, { useState, useEffect, useRef } from 'react';
import { VStack, Checkbox, Button, Input, useToast, Flex } from '@chakra-ui/react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const Checklist = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null); // useRef for the input element
    const { user } = useAuth();
    const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    const adjustInputHeight = () => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'; 
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    };

    adjustInputHeight();
  }, [newTaskTitle]);

  const fetchTasks = async () => {
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const querySnapshot = await getDocs(tasksRef);
    const tasksData = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Task)
      .reverse();
    setTasks(tasksData);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: 'Please enter a task.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      title: newTaskTitle,
      completed: false,
    });
    setNewTaskTitle('');
    toast({ title: 'Task added', status: 'success', duration: 1000 });
    fetchTasks();
  };

  const removeTask = async (id: string) => {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    toast({ title: 'Task removed', status: 'success', duration: 1000 });
    fetchTasks();
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      justify="flex-start"
      flex="1" 
      overflow="visible"
    >
      {tasks.map((task) => (
        <Flex key={task.id} justify="center" width="100%">
          <Checkbox
            size="lg"
            isChecked={task.completed}
            onChange={() => removeTask(task.id)}
          >
            {task.title}
          </Checkbox>
        </Flex>
      ))}

      <Flex justify="center" width="100%" mt="auto">
        <Input
          ref={inputRef}
          placeholder="Add new task"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          size="lg"
          overflowY="hidden"
        />
        <Button
          borderRadius="md"
          onClick={addTask}
          ml={2}
          size="lg"
        >
          +
        </Button>
      </Flex>
    </Flex>
  );
};

export default Checklist;