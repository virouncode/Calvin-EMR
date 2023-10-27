import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-widgets/scss/styles.scss";
import {
  deletePatientRecord,
  postPatientRecord,
  putPatientRecord,
} from "../../../../api/fetchRecords";
import axiosXano from "../../../../api/xano";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { patientIdToName } from "../../../../utils/patientIdToName";
import { relations } from "../../../../utils/relations";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { toInverseRelation } from "../../../../utils/toInverseRelation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";
import PatientsSelect from "../../../Lists/PatientsSelect";
import RelationshipList from "../../../Lists/RelationshipList";

const RelationshipItem = ({ item, editCounter, setErrMsgPost }) => {
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [itemInfos, setItemInfos] = useState(null);

  useEffect(() => {
    setItemInfos(item);
  }, [item]);

  const handleChange = (e) => {
    setErrMsgPost("");
    let value = parseInt(e.target.value);
    setItemInfos({ ...itemInfos, relation_id: value });
  };

  const handleRelationshipChange = (value, itemId) => {
    setErrMsgPost("");
    setItemInfos({ ...itemInfos, relationship: value });
  };

  const handleEditClick = () => {
    editCounter.current += 1;
    setErrMsgPost("");
    setEditVisible((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //Delete the inverse relation ship of item
      const inverseRelationToDeleteId = (
        await axiosXano.post(
          "/relationship_between",
          { patient_id: item.relation_id, relation_id: item.patient_id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data[0].id;

      await axiosXano.delete(`/relationships/${inverseRelationToDeleteId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });

      //Put the relationship
      await putPatientRecord(
        "/relationships",
        item.id,
        user.id,
        auth.authToken,
        itemInfos,
        socket,
        "RELATIONSHIPS"
      );
      //Post the inverse relation ship
      let inverseRelationToPost = {};
      inverseRelationToPost.patient_id = itemInfos.relation_id;
      const gender = clinic.patientsInfos.filter(
        ({ id }) => id === item.relation_id
      )[0].gender_identification;
      inverseRelationToPost.relationship = toInverseRelation(
        itemInfos.relationship,
        gender
      );
      inverseRelationToPost.relation_id = itemInfos.patient_id;

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
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to update relationship: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleDeleteClick = async (e) => {
    setErrMsgPost("");
    if (
      await confirmAlert({
        content: "Do you really want to delete this item ?",
      })
    ) {
      try {
        if (relations.includes(itemInfos.relationship)) {
          const inverseRelationToDeleteId = (
            await axiosXano.post(
              "/relationship_between",
              { patient_id: item.relation_id, relation_id: item.patient_id },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.authToken}`,
                },
              }
            )
          ).data[0].id;

          await deletePatientRecord(
            "/relationships",
            inverseRelationToDeleteId,
            auth.authToken,
            socket,
            "RELATIONSHIPS"
          );
        }
        await deletePatientRecord(
          "/relationships",
          item.id,
          auth.authToken,
          socket,
          "RELATIONSHIPS"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error unable to delete relationship: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  return (
    itemInfos && (
      <tr className="relationships-item">
        <td>
          <div className="relationships-item__relationship">
            {editVisible ? (
              <RelationshipList
                value={itemInfos.relationship}
                handleChange={handleRelationshipChange}
              />
            ) : (
              itemInfos.relationship
            )}
            <span>of</span>
          </div>
        </td>
        <td>
          {editVisible ? (
            <PatientsSelect
              handleChange={handleChange}
              value={itemInfos.relation_id}
              name="relation_id"
              patientId={itemInfos.patient_id}
            />
          ) : (
            patientIdToName(clinic.patientsInfos, itemInfos.relation_id)
          )}
        </td>
        <td>
          <em>
            {staffIdToTitleAndName(
              clinic.staffInfos,
              itemInfos.created_by_id,
              true
            )}{" "}
          </em>
        </td>
        <td>
          <em>{toLocalDate(itemInfos.date_created)}</em>
        </td>
        <td>
          <div className="relationships-item__btn-container">
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

export default RelationshipItem;
