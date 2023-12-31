import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  deletePatientRecord,
  putPatientRecord,
} from "../../../../api/fetchRecords";
import { getAvailableRooms } from "../../../../api/getAvailableRooms";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterUpper } from "../../../../utils/firstLetterUpper";
import {
  fromLocalToISOStringNoMs,
  toLocalAMPM,
  toLocalDate,
  toLocalHours,
  toLocalMinutes,
} from "../../../../utils/formatDates";
import { rooms } from "../../../../utils/rooms";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { statuses } from "../../../../utils/statuses";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";
import HostsList from "../../../EventForm/HostsList";
import RoomsList from "../../../EventForm/RoomsList";
import StatusList from "../../../EventForm/StatusList";
import TimePicker from "../../../Pickers/TimePicker";

const AppointmentEvent = ({ event, editCounter, setErrMsgPost }) => {
  //HOOKS
  const { auth, clinic, user, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [eventInfos, setEventInfos] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const previousStartDate = useRef(toLocalDate(event.start));
  const previousEndDate = useRef(toLocalDate(event.end));
  const previousStartHours = useRef(toLocalHours(event.start));
  const previousEndHours = useRef(toLocalHours(event.end));
  const previousStartMin = useRef(toLocalMinutes(event.start));
  const previousEndMin = useRef(toLocalMinutes(event.end));
  const previousStartAMPM = useRef(toLocalAMPM(event.start));
  const previousEndAMPM = useRef(toLocalAMPM(event.end));
  const startDateInput = useRef(null);
  const endDateInput = useRef(null);
  const startHourInput = useRef(null);
  const endHourInput = useRef(null);
  const startMinInput = useRef(null);
  const endMinInput = useRef(null);
  const startAMPMInput = useRef(null);
  const endAMPMInput = useRef(null);
  const minEndDate = useRef(toLocalDate(event.start));

  useEffect(() => {
    setEventInfos(event);
  }, [event]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAvailableRooms = async () => {
      try {
        const availableRoomsResult = await getAvailableRooms(
          event.id,
          event.start,
          event.end,
          auth.authToken,
          abortController
        );
        if (abortController.signal.aborted) return;
        setAvailableRooms(availableRoomsResult);
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(`Error: unable to get available rooms: ${err.message}`, {
            containerId: "B",
          });
      }
    };
    fetchAvailableRooms();
    return () => {
      abortController.abort();
    };
  }, [auth.authToken, event.end, event.host_id, event.id, event.start]);

  //HANDLERS
  const isSecretary = () => {
    return user.title === "Secretary";
  };

  const handleChange = (e) => {
    setErrMsgPost(false);
    const name = e.target.name;
    let value = e.target.value;
    setEventInfos({ ...eventInfos, [name]: value });
  };

  const handleHostChange = async (e) => {
    setErrMsgPost(false);
    const value = parseInt(e.target.value);
    setEventInfos({ ...eventInfos, host_id: value });
  };

  const handleRoomChange = async (e) => {
    setErrMsgPost(false);
    const name = e.target.name;
    const value = e.target.value;
    if (
      (isRoomOccupied(value) &&
        (await confirmAlert({
          content: `${value} will be occupied at this time slot, choose this room anyway ?`,
        }))) ||
      !isRoomOccupied(value)
    ) {
      setEventInfos({ ...eventInfos, [name]: value });
    }
  };

  const handleStartChange = async (e) => {
    setErrMsgPost(false);
    const dateValue = startDateInput.current.value; //choosen local date YYYY:MM:DD
    const hourValue = startHourInput.current.value; //choosen local hour
    const minValue = startMinInput.current.value; //choosen local min
    const ampmValue = startAMPMInput.current.value; //choosen local ampm
    const name = e.target.name;

    if (name === "date" && dateValue === "") {
      setEventInfos({ ...eventInfos, start: null });
      return;
    }

    if (name === "date" && eventInfos.all_day) {
      const startAllDay = new Date(startDateInput.current.value).setHours(
        0,
        0,
        0,
        0
      );
      let endAllDay = new Date(startAllDay);
      endAllDay = endAllDay.setDate(endAllDay.getDate() + 1);
      setEventInfos({ ...eventInfos, start: startAllDay, end: endAllDay });
      return;
    }

    let value = fromLocalToISOStringNoMs(
      dateValue,
      hourValue,
      minValue,
      ampmValue
    );

    value = Date.parse(new Date(value));
    const rangeEnd =
      new Date(value) > new Date(eventInfos.end) ? value : eventInfos.end;

    let hypotheticAvailableRooms;

    try {
      hypotheticAvailableRooms = await getAvailableRooms(
        event.id,
        value,
        rangeEnd,
        auth.authToken
      );

      if (
        eventInfos.room === "To be determined" ||
        hypotheticAvailableRooms.includes(eventInfos.room) ||
        (!hypotheticAvailableRooms.includes(eventInfos.room) &&
          (await confirmAlert({
            content: `${eventInfos.room} will be occupied at this time slot, book it anyway ?`,
          })))
      ) {
        switch (name) {
          case "date":
            previousStartDate.current = dateValue;
            minEndDate.current = dateValue;
            break;
          case "hour":
            previousStartHours.current = hourValue;
            break;
          case "min":
            previousStartMin.current = minValue;
            break;
          case "ampm":
            previousStartAMPM.current = ampmValue;
            break;
          default:
            break;
        }

        if (new Date(value) > new Date(eventInfos.end)) {
          setEventInfos({
            ...eventInfos,
            start: value,
            end: value,
            duration: 0,
          });
          endHourInput.value = startHourInput.value;
          endMinInput.value = startMinInput.value;
          endAMPMInput.value = startAMPMInput.value;
        } else {
          setEventInfos({
            ...eventInfos,
            start: value,
            duration: Math.floor((eventInfos.end - value) / (1000 * 60)),
          });
        }
      } else {
        //set input value to previous start
        switch (name) {
          case "date":
            e.target.value = previousStartDate.current;
            break;
          case "hour":
            e.target.value = previousStartHours.current;
            break;
          case "min":
            e.target.value = previousStartMin.current;
            break;
          case "ampm":
            e.target.value = previousStartAMPM.current;
            break;
          default:
            break;
        }
      }
    } catch (err) {
      toast.error(`Error: unable to save start date: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleEndChange = async (e) => {
    setErrMsgPost(false);
    const dateValue = endDateInput.current.value;
    const hourValue = endHourInput.current.value; //choosen local hour
    const minValue = endMinInput.current.value; //choosen local min
    const ampmValue = endAMPMInput.current.value; //choosen local ampm
    const name = e.target.name;

    if (name === "date" && dateValue === "") {
      setEventInfos({ ...eventInfos, end: null });
      return;
    }

    let value = fromLocalToISOStringNoMs(
      dateValue,
      hourValue,
      minValue,
      ampmValue
    );

    value = Date.parse(new Date(value));

    let hypotheticAvailableRooms;
    try {
      hypotheticAvailableRooms = await getAvailableRooms(
        event.id,
        eventInfos.start,
        value,
        auth.authToken
      );
      if (
        eventInfos.room === "To be determined" ||
        hypotheticAvailableRooms.includes(eventInfos.room) ||
        (!hypotheticAvailableRooms.includes(eventInfos.room) &&
          (await confirmAlert({
            content: `${eventInfos.room} will be occupied at this time slot, book it anyway ?`,
          })))
      ) {
        switch (name) {
          case "date":
            previousEndDate.current = dateValue;
            break;
          case "hour":
            previousEndHours.current = hourValue;
            break;
          case "min":
            previousEndMin.current = minValue;
            break;
          case "ampm":
            previousEndAMPM.current = ampmValue;
            break;
          default:
            break;
        }
        setEventInfos({
          ...eventInfos,
          end: value,
          duration: Math.floor((value - eventInfos.start) / (1000 * 60)),
        });
      } else {
        switch (name) {
          case "date":
            e.target.value = previousEndDate.current;
            break;
          case "hour":
            e.target.value = previousEndHours.current;
            break;
          case "min":
            e.target.value = previousEndMin.current;
            break;
          case "ampm":
            e.target.value = previousEndAMPM.current;
            break;
          default:
            break;
        }
      }
    } catch (err) {
      toast.error(`Error: unable to save end date: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleAllDayChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    value = value === "true"; //cast to boolean
    if (value) {
      if (eventInfos.start === null) {
        setErrMsgPost("Please choose a start date first");
        return;
      }
      const startAllDay = new Date(eventInfos.start).setHours(0, 0, 0, 0);
      let endAllDay = new Date(startAllDay);
      endAllDay = endAllDay.setDate(endAllDay.getDate() + 1);

      setEventInfos({
        ...eventInfos,
        all_day: true,
        start: startAllDay,
        end: endAllDay,
        duration: 1440,
      });
    } else {
      setEventInfos({
        ...eventInfos,
        all_day: false,
        duration: Math.floor((eventInfos.end - eventInfos.start) / (1000 * 60)),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    const formDatas = {
      ...eventInfos,
      reason: firstLetterUpper(eventInfos.reason),
    };
    setEventInfos({
      ...eventInfos,
      reason: firstLetterUpper(eventInfos.reason),
    });

    //Validation
    if (
      formDatas.start === null ||
      formDatas.end === null ||
      formDatas.reason === ""
    ) {
      setErrMsgPost("Please fill all fields");
      return;
    }
    try {
      await putPatientRecord(
        "/appointments",
        event.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "APPOINTMENTS"
      );

      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to save appointment: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleEditClick = (e) => {
    editCounter.current += 1;
    setErrMsgPost(false);
    setEditVisible((v) => !v);
  };

  const handleDeleteClick = async (e) => {
    if (
      await confirmAlert({
        content: "Do you really want to delete this item ?",
      })
    ) {
      try {
        await deletePatientRecord(
          "/appointments",
          event.id,
          auth.authToken,
          socket,
          "APPOINTMENTS"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error: unable to delete appointment: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  const isRoomOccupied = (roomName) => {
    if (roomName === "To be determined") {
      return false;
    }
    return availableRooms.includes(roomName) ? false : true;
  };

  return (
    eventInfos && (
      <tr className="appointments__event">
        <td style={{ minWidth: "170px" }}>
          {editVisible && isSecretary() ? (
            <HostsList
              staffInfos={clinic.staffInfos}
              handleHostChange={handleHostChange}
              hostId={eventInfos.host_id}
            />
          ) : (
            <p>
              {staffIdToTitleAndName(
                clinic.staffInfos,
                eventInfos.host_id,
                true
              )}
            </p>
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="reason"
              value={eventInfos.reason}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.reason
          )}
        </td>
        <td>
          {editVisible ? (
            <div className="appointments__event-date-container">
              <input
                type="date"
                value={
                  eventInfos.start !== null ? toLocalDate(eventInfos.start) : ""
                }
                onChange={handleStartChange}
                ref={startDateInput}
                name="date"
              />
              <TimePicker
                handleChange={handleStartChange}
                dateTimeValue={eventInfos.start}
                passingRefHour={startHourInput}
                passingRefMin={startMinInput}
                passingRefAMPM={startAMPMInput}
                readOnly={eventInfos.all_day}
              />
            </div>
          ) : eventInfos.start !== null ? (
            new Date(eventInfos.start).toLocaleString("en-CA", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })
          ) : (
            ""
          )}
        </td>
        <td>
          {editVisible ? (
            <div className="appointments__event-date-container">
              <input
                type="date"
                value={
                  eventInfos.end !== null ? toLocalDate(eventInfos.end) : ""
                }
                onChange={handleEndChange}
                min={minEndDate.current}
                ref={endDateInput}
                readOnly={eventInfos.all_day}
                name="date"
              />
              <TimePicker
                handleChange={handleEndChange}
                dateTimeValue={eventInfos.end}
                passingRefHour={endHourInput}
                passingRefMin={endMinInput}
                passingRefAMPM={endAMPMInput}
                readOnly={eventInfos.all_day}
              />
            </div>
          ) : eventInfos.end !== null ? (
            new Date(eventInfos.end).toLocaleString("en-CA", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })
          ) : (
            ""
          )}
        </td>
        <td>
          {editVisible ? (
            <select
              name="all_day"
              value={eventInfos.all_day.toString()}
              onChange={handleAllDayChange}
              style={{ width: "50px" }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : eventInfos.all_day ? (
            "Yes"
          ) : (
            "No"
          )}
        </td>
        <td>
          {editVisible ? (
            <RoomsList
              handleRoomChange={handleRoomChange}
              roomSelected={eventInfos.room}
              rooms={rooms}
              isRoomOccupied={isRoomOccupied}
              label={false}
            />
          ) : (
            eventInfos.room
          )}
        </td>
        <td>
          {editVisible ? (
            <StatusList
              handleChange={handleChange}
              statuses={statuses}
              selectedStatus={eventInfos.status}
              label={false}
            />
          ) : (
            eventInfos.status
          )}
        </td>
        <td>
          <em>
            {staffIdToTitleAndName(
              clinic.staffInfos,
              eventInfos.created_by_id,
              true
            )}
          </em>
        </td>
        <td>
          <em> {toLocalDate(eventInfos.date_created)} </em>
        </td>
        <td>
          {(isSecretary() || user.id === eventInfos.host_id) &&
            (!editVisible ? (
              <div className="appointments__event-btn-container">
                <button onClick={handleEditClick}>Edit</button>
                <button onClick={handleDeleteClick}>Delete</button>
              </div>
            ) : (
              <div className="appointments-event__btn-container">
                <input type="submit" value="Save" onClick={handleSubmit} />
                <button onClick={handleDeleteClick}>Delete</button>
              </div>
            ))}
        </td>
      </tr>
    )
  );
};

export default AppointmentEvent;
