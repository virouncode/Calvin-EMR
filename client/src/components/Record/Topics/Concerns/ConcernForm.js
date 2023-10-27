import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterUpper } from "../../../../utils/firstLetterUpper";
import { toISOStringNoMs, toLocalDate } from "../../../../utils/formatDates";
import formatName from "../../../../utils/formatName";
import { concernSchema } from "../../../../validation/concernValidation";

const ConcernForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    description: "",
  });

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    setFormDatas({
      ...formDatas,
      description: firstLetterUpper(formDatas.description),
    });
    const datasToPost = {
      ...formDatas,
      description: firstLetterUpper(formDatas.description),
    };
    //Validation
    try {
      await concernSchema.validate(datasToPost);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    try {
      await postPatientRecord(
        "/ongoing_concerns",
        user.id,
        auth.authToken,
        datasToPost,
        socket,
        "ONGOING CONCERNS"
      );

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to save ongoing concern: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <tr className="concerns__form">
      <td>
        <input
          name="description"
          onChange={handleChange}
          type="text"
          value={formDatas.description}
          autoComplete="off"
        />
      </td>
      <td>
        <em>{formatName(user.name)}</em>
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

export default ConcernForm;
