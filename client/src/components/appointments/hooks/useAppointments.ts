// @ts-nocheck
import dayjs from 'dayjs';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from '../../user/hooks/useUser';
import { AppointmentDateMap } from '../types';
import { getAvailableAppointments } from '../utils';
import { getMonthYearDetails, getNewMonthYear, MonthYear } from './monthYear';

// for useQuery call
async function getAppointments(
  year: string,
  month: string,
): Promise<AppointmentDateMap> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// types for hook return object
interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

// The purpose of this hook:
//   1. track the current month/year (aka monthYear) selected by the user
//     1a. provide a way to update state
//   2. return the appointments for that particular monthYear
//     2a. return in AppointmentDateMap format (appointment arrays indexed by day of month)
//     2b. prefetch the appointments for adjacent monthYears
//   3. track the state of the filter (all appointments / available appointments)
//     3a. return the only the applicable appointments for the current monthYear
export function useAppointments(): UseAppointments {
  /** ****************** START 1: monthYear state *********************** */
  // get the monthYear for the current date (for default monthYear state)
  const currentMonthYear = getMonthYearDetails(dayjs());

  // state to track current monthYear chosen by user
  // state value is returned in hook return object
  const [monthYear, setMonthYear] = useState(currentMonthYear);

  // setter to update monthYear obj in state when user changes month in view,
  // returned in hook return object
  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((prevData) => getNewMonthYear(prevData, monthIncrement));
  }
  /** ****************** END 1: monthYear state ************************* */
  /** ****************** START 2: filter appointments  ****************** */
  // State and functions for filtering appointments to show all or only available
  const [showAll, setShowAll] = useState(false);

  // We will need imported function getAvailableAppointments here
  // We need the user to pass to getAvailableAppointments so we can show
  //   appointments that the logged-in user has reserved (in white)
  const { user } = useUser();

  // useAppointments 훅이 호출될때마다, selectFn 함수가 무의미하게 재 생성되는 것을 방지하기위해 useCallback을 사용한다.
  // dependency에 user를 넣은 이유는 로그인하는 사용자가 바뀌거나, 사용자가 로그아웃할때마다, 해당함수를 재생성하여 새로운 user의 참조값을 받아와야하기때문이다.
  const selectFn = useCallback(
    // 원래 반환될 data를 인자로 받아온다.
    (data) => getAvailableAppointments(data, user),
    [user],
  );

  const fallback = {};

  const { data: appointments = fallback } = useQuery(
    [queryKeys.appointments, monthYear.year, monthYear.month],
    () => getAppointments(monthYear.year, monthYear.month),
    {
      // showAll이 true일 경우는 select옵션을 사용하지 않고 그냥 data를 그 자체를 반환시키고
      // showAll이 false일 경우는 selectFn함수를 실행시킨다. 셀렉트 함수는 원래 반환되었을 data를 가져와서 변환한 다음, 변환한 데이터를 data에 반환시켜준다
      select: showAll ? undefined : selectFn,
    },
  );

  const queryClient = useQueryClient();
  // 셀렉트는 prefetchQuery의 옵션은 아니다!
  React.useEffect(() => {
    const nextMonthYear = getNewMonthYear(monthYear, 1);
    queryClient.prefetchQuery(
      [queryKeys.appointments, nextMonthYear.year, nextMonthYear.month],
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
    );
  }, [queryClient, monthYear]);

  /** ****************** END 2: filter appointments  ******************** */
  /** ****************** START 3: useQuery  ***************************** */
  // useQuery call for appointments for the current monthYear

  // TODO: update with useQuery!
  // Notes:
  //    1. appointments is an AppointmentDateMap (object with days of month
  //       as properties, and arrays of appointments for that day as values)
  //
  //    2. The getAppointments query function needs monthYear.year and
  //       monthYear.month

  /** ****************** END 3: useQuery  ******************************* */

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}
