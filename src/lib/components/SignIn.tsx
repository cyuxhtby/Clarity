'use client';
import { Button, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '~/lib/contexts/AuthContext';

const SignIn = () => {
  // useColorModeValue used to switch colors based on the theme (light/dark mode)
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
        mt={6}
        onClick={handleSignIn}
      >
        Log in
      </Button>
    </VStack>
  );
};

export default SignIn;
