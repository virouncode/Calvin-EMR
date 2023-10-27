import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterOfFirstWordUpper } from "../../../../utils/firstLetterUpper";
import { toLocalDate } from "../../../../utils/formatDates";
import formatName from "../../../../utils/formatName";
import { medHistorySchema } from "../../../../validation/medHistoryValidation";

const MedHistoryForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    ongoing: "false",
    description: "",
    date_of_event: Date.now(),
  });

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    if (name === "date_of_event") {
      value = value === "" ? null : Date.parse(new Date(value));
    }
    if (name === "ongoing") {
      value = value === "true";
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    const datasToPost = {
      ...formDatas,
      description: firstLetterOfFirstWordUpper(formDatas.description),
    };
    //Validation
    try {
      await medHistorySchema.validate(datasToPost);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await postPatientRecord(
        "/medical_history",
        user.id,
        auth.authToken,
        datasToPost,
        socket,
        "MEDICAL HISTORY"
      );

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(
        `Error unable to save medical history event: ${err.message}`,
        { containerId: "B" }
      );
    }
  };

  return (
    <tr className="medhistory__form">
      <td>
        <select
          name="ongoing"
          value={formDatas.ongoing}
          onChange={handleChange}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </td>
      <td>
        <input
          name="description"
          type="text"
          value={formDatas.description}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="date_of_event"
          type="date"
          max={toLocalDate(new Date().toISOString())}
          value={
            formDatas.date_of_event !== null
              ? toLocalDate(formDatas.date_of_event)
              : ""
          }
          onChange={handleChange}
        />
      </td>
      <td>
        <em>{formatName(user.name)}</em>
      </td>
      <td>
        <em>{toLocalDate(Date.now())}</em>
      </td>
      <td>
        <input type="submit" value="Save" onClick={handleSubmit} />
      </td>
    </tr>
  );
};

export default MedHistoryForm;
