import { Box } from '@chakra-ui/react';
import { useView } from '~/lib/contexts/ViewContext';

const SwipeIndicator = ({ currentIndex, total }: { currentIndex: number; total: number }) => {
  const { setCurrentView, viewOrder } = useView();

  const handleDotClick = (index: number) => {
    setCurrentView(viewOrder[index]);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      {Array.from({ length: total }, (_, index) => (
        <Box
          key={index}
          width="8px"
          height="8px"
          borderRadius="full"
          backgroundColor={index === currentIndex ? 'white' : 'gray.500'}
          marginX="1"
          cursor="pointer"
          onClick={() => handleDotClick(index)}
          marginTop="12px"
        />
      ))}
    </Box>
  );
};

export default SwipeIndicator;
