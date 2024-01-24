import { Flex, Text } from '@chakra-ui/react';
import SwipeIndicator from '~/lib/components/SwipeIndicator';
import { useView } from '~/lib/contexts/ViewContext';

const Footer = () => {
  const { currentView, viewOrder } = useView();
  const currentIndex = viewOrder.indexOf(currentView);
  const total = viewOrder.length;

  return (
    <Flex as="footer" width="full" justifyContent="center" position="relative" paddingBottom="4">
      {currentView !== 'SignIn' && <SwipeIndicator currentIndex={currentIndex} total={total} />}
      <Text fontSize="sm"></Text>
    </Flex>
  );
};

export default Footer;