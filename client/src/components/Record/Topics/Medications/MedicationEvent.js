import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  deletePatientRecord,
  putPatientRecord,
} from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { medicationSchema } from "../../../../validation/medicationValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const MedicationEvent = ({
  event,
  editCounter,
  setErrMsgPost,
  presVisible,
  setPresVisible,
  medsRx,
  setMedsRx,
}) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [eventInfos, setEventInfos] = useState(null);

  useEffect(() => {
    setEventInfos(event);
  }, [event]);

  //HANDLERS
  const handleDeleteClick = async (e) => {
    setErrMsgPost("");
    if (
      await confirmAlert({
        content: "Do you really want to delete this item ?",
      })
    ) {
      try {
        await deletePatientRecord(
          "/medications",
          event.id,
          auth.authToken,
          socket,
          "MEDICATIONS"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error unable to delete medication: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  const handleChange = (e) => {
    setErrMsgPost("");
    const name = e.target.name;
    let value = e.target.value;
    if (name === "active") {
      value = value === "true";
    }
    if (name === "start") {
      value = value === "" ? null : Date.parse(new Date(value));
    }
    setEventInfos({ ...eventInfos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    setEventInfos({ ...eventInfos, name: eventInfos.name.toUpperCase() });
    const formDatas = { ...eventInfos, name: eventInfos.name.toUpperCase() };
    //Validation
    try {
      await medicationSchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await putPatientRecord(
        "/medications",
        event.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "MEDICATIONS"
      );
      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to update medication: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleEditClick = (e) => {
    setErrMsgPost("");
    editCounter.current += 1;
    setEditVisible((v) => !v);
  };

  const handleAddToRxClick = (e) => {
    if (!presVisible) {
      setMedsRx([...medsRx, event]);
      setPresVisible(true);
    } else {
      setMedsRx([...medsRx, event]);
    }
  };
  const handleRemoveFromRxClick = (e) => {
    let newMedsRx = [...medsRx];
    newMedsRx = newMedsRx.filter(({ id }) => id !== event.id);
    setMedsRx(newMedsRx);
  };

  return (
    eventInfos && (
      <tr
        className={
          event.active
            ? "medications__event"
            : "medications__event medications__event--notactive"
        }
      >
        <td>
          {editVisible ? (
            <select
              name="active"
              value={eventInfos.active.toString()}
              onChange={handleChange}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : eventInfos.active ? (
            "Yes"
          ) : (
            "No"
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.name}
              name="name"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.name
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.active_ingredients ?? ""}
              name="active_ingredients"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.active_ingredients
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.route_of_administration}
              name="route_of_administration"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.route_of_administration
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.dose}
              name="dose"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.dose
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.frequency}
              name="frequency"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.frequency
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.number_of_doses}
              name="number_of_doses"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.number_of_doses
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              value={eventInfos.duration}
              name="duration"
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.duration
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
          <div className="medications__event-btn-container">
            {!editVisible ? (
              <button onClick={handleEditClick}>Edit</button>
            ) : (
              <input type="submit" value="Save" onClick={handleSubmit} />
            )}
            <button onClick={handleDeleteClick}>Delete</button>
            {user.title === "Doctor" &&
              (presVisible ? (
                medsRx.find(({ id }) => id === event.id) ? (
                  <button
                    onClick={handleRemoveFromRxClick}
                    style={{ minWidth: "90px" }}
                  >
                    Rmv From Rx
                  </button>
                ) : (
                  <button
                    onClick={handleAddToRxClick}
                    style={{ minWidth: "90px" }}
                    // disabled={medsRx.find(({ id }) => id === event.id)}
                  >
                    Add To RX
                  </button>
                )
              ) : (
                <button
                  onClick={handleAddToRxClick}
                  style={{ minWidth: "90px" }}
                  // disabled={medsRx.find(({ id }) => id === event.id)}
                >
                  Add To RX
                </button>
              ))}
          </div>
        </td>
      </tr>
    )
  );
};

export default MedicationEvent;
