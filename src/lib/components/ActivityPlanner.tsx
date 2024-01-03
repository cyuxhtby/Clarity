import React, { useState, useEffect } from 'react';
import { VStack, useColorModeValue } from '@chakra-ui/react';
import { collection, addDoc, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';
import HourBlock from './HourBlock'; 

interface Activities {
  [hour: string]: string;
}

const ActivityPlanner: React.FC = () => {
    const [activities, setActivities] = useState<Activities>({});
    const { user } = useAuth();
    const bg = useColorModeValue('gray.50', 'gray.700');
  
  
      const fetchActivities = async () => {
        if (!user) return;
    
        try {
          console.log("Fetching activities for user:", user.uid);
          const userDocRef = doc(db, "users", user.uid);
          const activitiesCollectionRef = collection(userDocRef, "activities");
          const activitiesSnapshot = await getDocs(activitiesCollectionRef);
          const activitiesData: Activities = {};
          activitiesSnapshot.forEach((docSnapshot) => {
            activitiesData[docSnapshot.id] = docSnapshot.data().text;
          });
          setActivities(activitiesData);
        } catch (error) {
        }
      };
    
      useEffect(() => {
        fetchActivities();
      }, [user]);
    
  
      const saveActivity = async (hour: string, activityText: string) => {
        if (!user || activityText.trim() === '') {
            return;
        }
      
        const userDocRef = doc(db, "users", user.uid);
        const activityDocRef = doc(collection(userDocRef, "activities"), hour);
      
        try {
          await setDoc(activityDocRef, { text: activityText });      
          setActivities((prevActivities) => ({ ...prevActivities, [hour]: activityText }));
        } catch (error: any) {
          if ("code" in error && error.code === "permission-denied") {
            console.error("Firestore permission denied:", error);
          } else {
            console.error("Error saving activity:", error);
          }
        }
      };

      const deleteActivity = async (hour: string) => {
        if (!user) {
          console.error("No authenticated user found");
          return;
        }
    
        console.log("Deleting activity for hour:", hour);
        const userDocRef = doc(db, "users", user.uid);
        const activityDocRef = doc(collection(userDocRef, "activities"), hour);
    
        try {
          await deleteDoc(activityDocRef);
          console.log("Activity deleted successfully for hour:", hour);
    
          setActivities((prevActivities) => {
            const updatedActivities = { ...prevActivities };
            delete updatedActivities[hour];
            return updatedActivities;
          });
        } catch (error: any) {
          console.error("Error deleting activity:", error);
        }
      };
      
      
  
    const hours = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`);
  
    return (
        <VStack bg={bg} p={4} borderRadius="md" boxShadow="md" spacing={4} zIndex={20} position="relative">
        {hours.map((hour, index) => (
          <HourBlock
            key={index}
            hour={hour}
            saveActivity={saveActivity}
            deleteActivity={deleteActivity}
            activity={activities[hour]}
          />
        ))}
      </VStack>
    );
  };
  
  export default ActivityPlanner;