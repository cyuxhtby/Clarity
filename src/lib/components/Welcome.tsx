"use client"
import React, { useState } from 'react';
import { VStack, Text, Input, Button } from '@chakra-ui/react';
import { useAuth } from '~/lib/contexts/AuthContext'; 

export const Welcome = () => {
  const { signOut } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAddItem = () => {
    const date = new Date(newDate);
    const now = new Date();
    //const hoursUntil = Math.abs(date - now) / 36e5; // 36e5 is the scientific notation for 60*60*1000, converting milliseconds to hours
    //setItems([...items, { name: newItem, date: newDate, hoursUntil }]);
    setNewItem('');
    setNewDate('');
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="2xl">Welcome to the App!</Text>
      <VStack spacing={2} align="stretch">
        <Input
          placeholder="Item name"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Input
          placeholder="Date (e.g., 2023-07-20)"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          type="date"
        />
        <Button colorScheme="blue" onClick={handleAddItem}>Add Item</Button>
      </VStack>
      {items.map((item, index) => (
        <Text>  hours until .... shi idk </Text>
      ))}
      <Button colorScheme="red" onClick={signOut}>Sign Out</Button>
    </VStack>
  );
};
