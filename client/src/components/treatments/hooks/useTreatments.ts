import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  const toast = useCustomToast();
  // TODO: get data from server via useQuery
  const fallback = [];

  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
    staleTime: 10000,
    cacheTime: 5000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // useErrorBoundary: true,
    // onError: (error) => {
    //   console.log('Detail Error Handle');
    //   const title =
    //     error instanceof Error
    //       ? error.message
    //       : 'error connecting to the server';
    //   toast({ title, status: 'error' });
    // },
  });
  return data;
}

// queryKeys.treatments 데이터 Prefetch
export function usePrefetchTreatments(): void {
  console.log('다시호출!');
  const queryClient = useQueryClient();
  // 위에서 useQuery에서 선언한 key과 같은 같이여야 Prefetch의 의미가 있는것이다.
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments, {
    staleTime: 7000,
    cacheTime: 5000,
  });
}
