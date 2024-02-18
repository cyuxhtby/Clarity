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
    <Flex as="footer" width="full" justifyContent="center" position="relative" paddingBottom="4">
      {user && currentView !== 'signin' && <SwipeIndicator currentIndex={currentIndex} total={total} />}
      <Text fontSize="sm"></Text>
    </Flex>
  );
};

export default Footer;