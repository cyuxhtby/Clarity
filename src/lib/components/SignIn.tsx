'use client';
import { Button, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '~/lib/contexts/AuthContext';

const SignIn = () => {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <VStack height="100%" justifyContent="center" textAlign="center" p={8}>
      <Text fontSize="6xl" fontWeight="bold" colorScheme="white">
        CLARITY
      </Text>
      <Button
        size="lg"
        width="60%"
        colorScheme="teal"
        variant="solid"
        mt={8}
        onClick={handleSignIn}
      >
        Log in
      </Button>
      <Text transform={{base: "scale(0.65)", md: "scale(0.9)"}} mt={4}>In Safari tap the share icon to add to home screen</Text>
    </VStack>
  );
};

export default SignIn;
