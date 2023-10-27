import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toISOStringNoMs, toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { pregnancySchema } from "../../../../validation/pregnancyValidation";
import PregnanciesList from "../../../Lists/PregnanciesList";

const PregnancyForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    description: "",
    date_of_event: Date.now(),
    premises: "",
    term_nbr_of_weeks: "",
    term_nbr_of_days: "",
  });

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    if (name === "date_of_event") {
      value = value === "" ? null : Date.parse(new Date(value));
    }
    if (name === "term_nbr_of_weeks" || name === "term_nbr_of_days") {
      value = parseInt(value);
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validation
    const formDatasForValidation = { ...formDatas };
    if (formDatasForValidation.term_nbr_of_weeks === "") {
      formDatasForValidation.term_nbr_of_weeks = 0;
    }
    if (formDatasForValidation.term_nbr_of_days === "") {
      formDatasForValidation.term_nbr_of_days = 0;
    }
    try {
      await pregnancySchema.validate(formDatasForValidation);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await postPatientRecord(
        "/pregnancies",
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "PREGNANCIES"
      );

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to save pregnancey event: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <tr className="pregnancies-form">
      <td>
        <PregnanciesList
          value={formDatas.description}
          name="description"
          handleChange={handleChange}
        />
      </td>
      <td>
        <input
          name="date_of_event"
          type="date"
          value={
            formDatas.date_of_event !== null
              ? toLocalDate(formDatas.date_of_event)
              : ""
          }
          onChange={handleChange}
          className="pregnancies-form__input2"
        />
      </td>
      <td>
        <input
          name="premises"
          type="text"
          value={formDatas.premises}
          onChange={handleChange}
          autoComplete="off"
          className="pregnancies-form__input1"
        />
      </td>
      <td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            width: "150px",
          }}
        >
          <input
            name="term_nbr_of_weeks"
            type="number"
            value={formDatas.term_nbr_of_weeks}
            onChange={handleChange}
            autoComplete="off"
            className="pregnancies-form__input3"
          />
          w
          <input
            name="term_nbr_of_days"
            type="number"
            value={formDatas.term_nbr_of_days}
            onChange={handleChange}
            autoComplete="off"
            className="pregnancies-form__input3"
          />
          d
        </div>
      </td>
      <td>
        <em>{staffIdToTitleAndName(clinic.staffInfos, user.id, true)}</em>{" "}
      </td>
      <td>
        <em>{toLocalDate(toISOStringNoMs(new Date()))}</em>
      </td>
      <td style={{ textAlign: "center" }}>
        <input type="submit" value="Save" onClick={handleSubmit} />
      </td>
    </tr>
  );
};

export default PregnancyForm;
