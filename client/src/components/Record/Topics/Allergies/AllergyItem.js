import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  deletePatientRecord,
  putPatientRecord,
} from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterUpper } from "../../../../utils/firstLetterUpper";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { allergySchema } from "../../../../validation/allergyValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const AllergyItem = ({ item, editCounter, setErrMsgPost }) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [itemInfos, setItemInfos] = useState(null);

  useEffect(() => {
    setItemInfos(item);
  }, [item]);

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    const name = e.target.name;
    let value = e.target.value;
    setItemInfos({ ...itemInfos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    const formDatas = {
      ...itemInfos,
      allergy: firstLetterUpper(itemInfos.allergy),
    };
    setItemInfos({
      ...itemInfos,
      allergy: firstLetterUpper(itemInfos.allergy),
    });
    //Validation
    try {
      await allergySchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await putPatientRecord(
        "/allergies",
        item.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "ALLERGIES"
      );
      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to update allergy: ${err.message}`, {
        containerId: "B",
      });
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
          "/allergies",
          item.id,
          auth.authToken,
          socket,
          "ALLERGIES"
        );

        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error: unable to delete item: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  return (
    itemInfos && (
      <tr className="allergies__item">
        <td>
          {editVisible ? (
            <input
              name="allergy"
              type="text"
              value={itemInfos.allergy}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            itemInfos.allergy
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
        <td style={{ textAlign: "center" }}>
          <div className="allergies__item-btn-container">
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

export default AllergyItem;
