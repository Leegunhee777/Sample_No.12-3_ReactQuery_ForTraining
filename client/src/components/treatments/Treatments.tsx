import { Box, Heading, HStack } from '@chakra-ui/react';
// eslint-disable-next-line import/no-unresolved
import { useCustomToast } from 'components/app/hooks/useCustomToast';
import { ReactElement, useEffect } from 'react';

import { useTreatments } from './hooks/useTreatments';
import { Treatment } from './Treatment';

export function Treatments(): ReactElement {
  // replace with data from React Query
  const treatments = useTreatments();
  const toast = useCustomToast();

  return (
    <Box>
      <Heading mt={10}>Available Treatments</Heading>
      <HStack m={10} spacing={8} justify="center">
        {treatments.map((treatmentData) => (
          <Treatment key={treatmentData.id} treatmentData={treatmentData} />
        ))}
      </HStack>
    </Box>
  );
}
