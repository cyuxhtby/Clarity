import React, { useState, useEffect, useRef } from 'react';
import { VStack, Checkbox, Button, useToast, Flex, Box, useColorModeValue, Text, IconButton } from '@chakra-ui/react';
import { collection, deleteDoc, doc, setDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoGrabber } from 'react-icons/go';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

const Checklist = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const checklistRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const unsubscribe = onSnapshot(tasksRef, (querySnapshot) => {
        const tasksData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Task))
          .sort((a, b) => a.order - b.order);
        setTasks(tasksData);
      });
      return () => unsubscribe();
    }
  }, [user]);

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
                order: task.order,
              });
              toast.close(toastId);
            }}
          >
            Undo
          </Button>
        </Box>
      ),
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      const batch = writeBatch(db);
      newTasks.forEach((task, index) => {
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', task.id);
        batch.update(taskDocRef, { order: index });
      });
      await batch.commit();
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <VStack ref={checklistRef} align="stretch" spacing={4} width="100%" overflowY="auto" minHeight={400} justifyContent="center" zIndex={20}>
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableItem key={task.id} id={task.id} task={task} removeTask={removeTask} />
          ))}
        </SortableContext>
        {/* spacing to not get cut off by footer */}
        {tasks.length > 8 ? <Box height={10} /> : <Box height={0} />}
      </VStack>
    </DndContext>
  );
};

const SortableItem = ({ id, task, removeTask }: { id: string; task: Task; removeTask: (task: Task) => void }) => {
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
              className="grabber-handle"
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

export default Checklist;