import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      // request시 jwt인증을 헤더에 넣어서 보내야할경우
      headers: getJWTHeader(user),
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

// 로컬스토리지와 쿼리캐시에서 사용자의 상태를 유지하는 책임
export function useUser(): UseUser {
  const queryClient = useQueryClient();
  // TODO: call useQuery to update user data from server
  const { data: user } = useQuery(queryKeys.user, () => getUser(user), {
    initialData: getStoredUser(),
    onSuccess: (receiced: User | null) => {
      if (!receiced) {
        clearStoredUser();
      } else {
        setStoredUser(receiced);
      }
    },
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // TODO: update the user in the query cache
    queryClient.setQueryData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // TODO: reset user to null in query cache
    queryClient.setQueryData(queryKeys.user, null);
    // 로그아웃하면 user-appointments 키에 저장되어있는 데이터(본인은 예약정보) 캐시데이터는 더이상 필요가 없어지므로 로그아웃할때, 해당 쿼리도 삭제해준다.
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);
  }

  return { user, updateUser, clearUser };
}
