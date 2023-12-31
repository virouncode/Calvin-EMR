import { useCallback, useEffect, useReducer } from "react";
import axiosXano from "../api/xano";
import useAuth from "./useAuth";
import { parseToEvents } from "../utils/parseToEvents";

const initialState = {
  events: null,
  remainingStaff: [],
  isLoading: false,
  errMsg: null,
};

const httpReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: state.events ? false : true, errMsg: null };
    case "FETCH_ERROR":
      return {
        events: null,
        remainingStaff: [],
        isLoading: false,
        errMsg: action.payload,
      };
    case "FETCH_SUCCESS":
      return {
        events: action.payload[0],
        remainingStaff: action.payload[1],
        isLoading: false,
        errMsg: null,
      };
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    default:
      return initialState;
  }
};

export const useEvents = (
  hostsIds,
  rangeStart,
  rangeEnd,
  isSecretary,
  userId
) => {
  const { auth, clinic } = useAuth();
  const [httpState, dispatch] = useReducer(httpReducer, initialState);
  const fetchEvents = useCallback(
    async (abortController) => {
      try {
        dispatch({ type: "FETCH_START" });
        const response = await axiosXano.post(
          "/appointments_for_staff",
          {
            hosts_ids: hostsIds,
            range_start: rangeStart,
            range_end: rangeEnd,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
            signal: abortController.signal,
          }
        );
        const formattedEvents = parseToEvents(
          response.data,
          clinic.staffInfos,
          isSecretary,
          userId
        );
        if (abortController.signal.aborted) return;
        dispatch({ type: "FETCH_SUCCESS", payload: formattedEvents });
      } catch (err) {
        if (err.name !== "CanceledError") {
          dispatch({
            type: "FETCH_ERROR",
            payload: `Error: unable to fetch appointments: ${err.message}`,
          });
        }
      }
    },
    [
      auth.authToken,
      clinic.staffInfos,
      hostsIds,
      isSecretary,
      rangeEnd,
      rangeStart,
      userId,
    ]
  );

  const setEvents = (newEvents) => {
    dispatch({ type: "SET_EVENTS", payload: newEvents });
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchEvents(abortController);
    return () => {
      abortController.abort();
    };
  }, [fetchEvents]);

  return [httpState, fetchEvents, setEvents];
};
