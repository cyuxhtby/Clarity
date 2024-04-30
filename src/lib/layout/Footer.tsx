import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import SwipeIndicator from '~/lib/components/SwipeIndicator';
import { useView } from '~/lib/contexts/ViewContext';
import { useAuth } from '~/lib/contexts/AuthContext';

const Footer = () => {
  const { currentView, viewOrder } = useView();
  const { user } = useAuth();
  const currentIndex = viewOrder.indexOf(currentView);
  const total = viewOrder.length;
  const bg = useColorModeValue('rgba(255, 255, 255, 1)', 'rgba(26, 32, 44, 1)');

  return (
    <Flex as="footer" width="full" justifyContent="center" position="fixed" bottom="0" left="0" right="0" pb="10" pt="6" zIndex="10" backgroundColor={bg}>
      {user && currentView !== 'signin' && <SwipeIndicator currentIndex={currentIndex} total={total} />}
      <Text fontSize="sm"></Text>
    </Flex>
  );
};

export default Footer;