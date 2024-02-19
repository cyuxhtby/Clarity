import { Flex, Text } from '@chakra-ui/react';
import SwipeIndicator from '~/lib/components/SwipeIndicator';
import { useView } from '~/lib/contexts/ViewContext';
import { useAuth } from '~/lib/contexts/AuthContext';

const Footer = () => {
  const { currentView, viewOrder } = useView();
  const { user } = useAuth();
  const currentIndex = viewOrder.indexOf(currentView);
  const total = viewOrder.length;

  return (
    <Flex as="footer" width="full" justifyContent="center" position="fixed" bottom="0" left="0" right="0" paddingBottom="4" marginTop="10" zIndex="10" backdropFilter="blur(30px)">
      {user && currentView !== 'signin' && <SwipeIndicator currentIndex={currentIndex} total={total} />}
      <Text fontSize="sm"></Text>
    </Flex>
  );
};

export default Footer;