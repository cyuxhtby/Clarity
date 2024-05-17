import React, { useState, useEffect, useRef } from 'react';
import { VStack, Box, useToast, Button, Text } from '@chakra-ui/react';
import { collection, deleteDoc, doc, setDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

const Checklist: React.FC = () => {
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
        <Box color="white" p={3} bg="green.500" borderRadius="lg" display="flex" alignItems="center">
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
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem key={task.id} id={task.id} task={task} removeTask={removeTask} />
            ))
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Text fontSize="lg" fontWeight="bold">
                Your tasks will show here
              </Text>
            </Box>
          )}
        </SortableContext>
        {/* spacing to not get cut off by footer */}
        {tasks.length > 8 ? <Box height={10} /> : <Box height={0} />}
      </VStack>
    </DndContext>
  );
};

export default Checklist;
