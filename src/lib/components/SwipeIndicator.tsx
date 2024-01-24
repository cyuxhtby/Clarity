import { Box } from '@chakra-ui/react';

const SwipeIndicator = ({ currentIndex, total }: { currentIndex: number, total: number }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      {Array(total).fill(null).map((_, index) => (
        <Box
          key={index}
          width="5px"
          height="5px"
          borderRadius="full"
          backgroundColor={index === currentIndex ? 'white' : 'gray.500'}
          marginX="1"
        />
      ))}
    </Box>
  );
};

export default SwipeIndicator;