import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterOfFirstWordUpper } from "../../../../utils/firstLetterUpper";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { reminderSchema } from "../../../../validation/reminderValidation";

const ReminderForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    active: true,
    reminder: "",
  });
  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    if (name === "active") {
      value = value === "true";
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    setFormDatas({
      ...formDatas,
      reminder: firstLetterOfFirstWordUpper(formDatas.reminder),
    });
    const datasToPost = {
      ...formDatas,
      reminder: firstLetterOfFirstWordUpper(formDatas.reminder),
    };
    //Validation
    try {
      await reminderSchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await postPatientRecord(
        "/reminders",
        user.id,
        auth.authToken,
        datasToPost,
        socket,
        "REMINDERS/ALERTS"
      );

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to save reminder: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <tr className="reminders__form">
      <td>
        <select
          name="active"
          value={formDatas.active.toString()}
          onChange={handleChange}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </td>
      <td>
        <input
          type="text"
          value={formDatas.reminder}
          name="reminder"
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <em>{staffIdToTitleAndName(clinic.staffInfos, user.id, true)}</em>
      </td>
      <td>
        <em>{toLocalDate(Date.now())}</em>
      </td>
      <td style={{ textAlign: "center" }}>
        <input type="submit" value="Save" onClick={handleSubmit} />
      </td>
    </tr>
  );
};

export default ReminderForm;
