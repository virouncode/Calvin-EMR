import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-widgets/scss/styles.scss";
import { postPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toISOStringNoMs, toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { toInverseRelation } from "../../../../utils/toInverseRelation";
import { relationshipSchema } from "../../../../validation/relationshipValidation";
import PatientsSelect from "../../../Lists/PatientsSelect";
import RelationshipList from "../../../Lists/RelationshipList";

const RelationshipForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setErrMsgPost,
}) => {
  const { auth, user, clinic, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    relationship: "",
    relation_id: "",
  });

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = parseInt(e.target.value);
    setFormDatas({ ...formDatas, relation_id: value });
  };

  const handleRelationshipChange = (value, itemId) => {
    setFormDatas({ ...formDatas, relationship: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validation
    try {
      await relationshipSchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      //Post the relationship
      await postPatientRecord(
        "/relationships",
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "RELATIONSHIPS"
      );

      //Post the inverse relationship
      let inverseRelationToPost = {};
      inverseRelationToPost.patient_id = formDatas.relation_id;
      const gender = clinic.patientsInfos.filter(
        ({ id }) => id === formDatas.relation_id
      )[0].gender_identification;
      inverseRelationToPost.relationship = toInverseRelation(
        formDatas.relationship,
        gender
      );
      inverseRelationToPost.relation_id = formDatas.patient_id;

      if (inverseRelationToPost.relationship !== "Undefined") {
        await postPatientRecord(
          "/relationships",
          user.id,
          auth.authToken,
          inverseRelationToPost,
          socket,
          "RELATIONSHIPS"
        );
      }
      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to save relationship: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <tr className="relationships-form">
      <td>
        <div className="relationships-form__relationship">
          <RelationshipList
            value={formDatas.relationship}
            handleChange={handleRelationshipChange}
          />
          <span>of</span>
        </div>
      </td>
      <td>
        <PatientsSelect
          handleChange={handleChange}
          value={formDatas.relation_id}
          name="relation_id"
          patientId={patientId}
        />
      </td>
      <td>
        <em>{staffIdToTitleAndName(clinic.staffInfos, user.id, true)}</em>
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

export default RelationshipForm;
