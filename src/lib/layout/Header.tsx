import { Box, Flex } from '@chakra-ui/react';
import ThemeToggle from './ThemeToggle';
import EnablePush from './EnablePush';
import { useAuth } from '~/lib/contexts/AuthContext'

const Header = () => {
  const { user } = useAuth();
  
  return (
    <Flex as="header" width="full" align="center">
      <Box marginLeft="auto">
       {user && <EnablePush />}
        <ThemeToggle />
      </Box>
    </Flex>
  );
};

export default Header;
