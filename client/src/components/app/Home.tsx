/* eslint-disable react/button-has-type */
import { Icon, Stack, Text } from '@chakra-ui/react';
// eslint-disable-next-line import/no-unresolved
import { usePrefetchTreatments } from 'components/treatments/hooks/useTreatments';
import React, { ReactElement } from 'react';
import { GiFlowerPot } from 'react-icons/gi';

import { BackgroundImage } from '../common/BackgroundImage';

export function Home(): ReactElement {
  const [state, setState] = React.useState(0);

  usePrefetchTreatments();
  return (
    <Stack align="center" justify="center" height="84vh">
      <BackgroundImage />
      <Text textAlign="center" fontFamily="Forum, sans-serif" fontSize="6em">
        <Icon m={4} verticalAlign="top" as={GiFlowerPot} />
        Lazy Days Spa
      </Text>
      <button onClick={() => setState((prev) => prev + 1)}>클릭</button>
      <Text>Hours: limited</Text>
      <Text>Address: nearby</Text>
    </Stack>
  );
}
