import React, { useState, useEffect } from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { doc, setDoc, getDoc, getDocs, addDoc, collection, Timestamp, FirestoreError } from 'firebase/firestore';
import { firestore as db } from '~/lib/utils/firebaseConfig';
import { useAuth } from '~/lib/contexts/AuthContext';

const ClockIn = () => {
    const { user } = useAuth();
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState<Date | null>(null);
    const [timer, setTimer] = useState('00:00:00');
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        if (user) {
            const clockInDocRef = doc(db, "users", user.uid, "clockInData", "clockInInfo");
            getDoc(clockInDocRef).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    if (data.clockedIn) {
                        setClockInTime(new Date(data.clockInTime.seconds * 1000));
                        setIsClockedIn(true);
                    }
                }
            }).catch((error: FirestoreError) => {
                console.error("Error fetching clock in data: ", error);
            });

            const sessionsRef = collection(db, "users", user.uid, "sessions");
            getDocs(sessionsRef).then(querySnapshot => {
                const total = querySnapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0);
                setTotalDuration(total);
            });
        }
    }, [user]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isClockedIn && clockInTime) {
            interval = setInterval(() => {
                const now = new Date();
                const elapsed = now.getTime() - clockInTime.getTime();
                setTimer(formatElapsedTime(elapsed));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isClockedIn, clockInTime]);

    const handleClockIn = async () => {
        if (user) {
            const currentTime = new Date();
            setClockInTime(currentTime);
            setIsClockedIn(true);
            await setDoc(doc(db, "users", user.uid, "clockInData", "clockInInfo"), { clockedIn: true, clockInTime: Timestamp.fromDate(currentTime) });
        }
    };

    const handleClockOut = async () => {
        if (user && clockInTime) {
            const clockOutTime = new Date();
            const duration = clockOutTime.getTime() - clockInTime.getTime();

            await addDoc(collection(db, "users", user.uid, "sessions"), {
                startTime: Timestamp.fromDate(clockInTime),
                endTime: Timestamp.fromDate(clockOutTime),
                duration,
            });

            await setDoc(doc(db, "users", user.uid, "clockInData", "clockInInfo"), { clockedIn: false });

            setTotalDuration(prevDuration => prevDuration + duration);

            setIsClockedIn(false);
            setClockInTime(null);
        }
    };

    const formatElapsedTime = (elapsed: any) => {
        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
    };

    const formatTotalDuration = (duration: any) => {
        const totalSeconds = Math.floor(duration / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    };

    const colorScheme = "blue"; 

    return (
        <VStack spacing={4} position="relative" zIndex={20}>
            {!isClockedIn ? (
                <>
                    <Button colorScheme="blue" onClick={handleClockIn}>
                        Clock In
                    </Button>
                    <Text>Total time worked: {formatTotalDuration(totalDuration)}</Text>
                </>
            ) : (
                <>
                    <Text fontSize="2xl" fontWeight="bold">{timer}</Text>
                    <Button colorScheme="red" onClick={handleClockOut}>
                        Clock Out
                    </Button>
                </>
            )}
        </VStack>
    );
};

export default ClockIn;
