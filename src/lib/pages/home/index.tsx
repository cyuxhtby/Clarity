import { Flex } from '@chakra-ui/react';

import CTASection from '~/lib/components/samples/CTASection';

const Home = () => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      gap={4}
      mb={8}
      w="full"
    >
      <CTASection />
    </Flex>
  );
};

export default Home;
