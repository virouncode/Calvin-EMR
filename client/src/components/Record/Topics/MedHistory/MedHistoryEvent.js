import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  deletePatientRecord,
  putPatientRecord,
} from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterOfFirstWordUpper } from "../../../../utils/firstLetterUpper";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { medHistorySchema } from "../../../../validation/medHistoryValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const MedHistoryEvent = ({ event, editCounter, setErrMsgPost }) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [eventInfos, setEventInfos] = useState(null);

  useEffect(() => {
    setEventInfos(event);
  }, [event]);

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    const name = e.target.name;
    let value = e.target.value;
    if (name === "date_of_event") {
      value = value === "" ? null : Date.parse(new Date(value));
    }
    if (name === "ongoing") {
      value = value === "true";
    }
    setEventInfos({ ...eventInfos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    setEventInfos({
      ...eventInfos,
      description: firstLetterOfFirstWordUpper(eventInfos.description),
    });
    const formDatas = {
      ...eventInfos,
      description: firstLetterOfFirstWordUpper(eventInfos.description),
    };

    //Validation
    try {
      await medHistorySchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await putPatientRecord(
        "/medical_history",
        event.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "MEDICAL HISTORY"
      );
      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(
        `Error unable to update medical history event: ${err.message}`,
        { containerId: "B" }
      );
    }
  };

  const handleEditClick = (e) => {
    editCounter.current += 1;
    setErrMsgPost("");
    setEditVisible((v) => !v);
  };

  const handleDeleteClick = async (e) => {
    setErrMsgPost("");
    if (
      await confirmAlert({
        content: "Do you really want to delete this item ?",
      })
    ) {
      try {
        await deletePatientRecord(
          "/medical_history",
          event.id,
          auth.authToken,
          socket,
          "MEDICAL HISTORY"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(
          `Error unable to delete medical history event: ${err.message}`,
          { containerId: "B" }
        );
      }
    }
  };

  return (
    eventInfos && (
      <tr
        className={
          event.ongoing
            ? "medhistory__event"
            : "medhistory__event medhistory__event--notgoing"
        }
      >
        <td>
          {editVisible ? (
            <select
              name="ongoing"
              value={eventInfos.ongoing.toString()}
              onChange={handleChange}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : eventInfos.ongoing ? (
            "Yes"
          ) : (
            "No"
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              name="description"
              type="text"
              value={eventInfos.description}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.description
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              name="date_of_event"
              type="date"
              max={toLocalDate(new Date().toISOString())}
              value={
                eventInfos.date_of_event !== null
                  ? toLocalDate(eventInfos.date_of_event)
                  : ""
              }
              onChange={handleChange}
            />
          ) : eventInfos.date_of_event !== null ? (
            toLocalDate(eventInfos.date_of_event)
          ) : (
            ""
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
          <em>{toLocalDate(eventInfos.date_created)}</em>
        </td>
        <td>
          <div className="medhistory__event-btn-container">
            {!editVisible ? (
              <button onClick={handleEditClick}>Edit</button>
            ) : (
              <input type="submit" value="Save" onClick={handleSubmit} />
            )}
            <button onClick={handleDeleteClick}>Delete</button>
          </div>
        </td>
      </tr>
    )
  );
};

export default MedHistoryEvent;
