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
import { famHistorySchema } from "../../../../validation/famHistoryValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";
import RelativesList from "../../../Lists/RelativesList";

const FamHistoryEvent = ({ event, editCounter, setErrMsgPost }) => {
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
    setEventInfos({ ...eventInfos, [name]: value });
  };

  const handleMemberChange = (value) => {
    setEventInfos({ ...eventInfos, family_member_affected: value });
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
      await famHistorySchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await putPatientRecord(
        "/family_history",
        event.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "FAMILY HISTORY"
      );
      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(
        `Error unable to update family history item: ${err.message}`,
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
          "/family_history",
          event.id,
          auth.authToken,
          socket,
          "FAMILY HISTORY"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(
          `Error unable to delete family history item: ${err.message}`,
          { containerId: "B" }
        );
      }
    }
  };

  return (
    eventInfos && (
      <tr className="famhistory__event">
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
            <RelativesList
              handleChange={handleMemberChange}
              value={eventInfos.family_member_affected}
            />
          ) : (
            eventInfos.family_member_affected
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="date"
              max={toLocalDate(new Date().toISOString())}
              name="date_of_event"
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
          <div className="famhistory__event-btn-container">
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

export default FamHistoryEvent;
