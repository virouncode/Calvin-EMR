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
import { riskSchema } from "../../../../validation/riskValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const RiskItem = ({ item, editCounter, setErrMsgPost }) => {
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
    const value = e.target.value;
    setItemInfos({ ...itemInfos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    setItemInfos({
      ...itemInfos,
      description: firstLetterOfFirstWordUpper(itemInfos.description),
    });
    const formDatas = {
      ...itemInfos,
      description: firstLetterOfFirstWordUpper(itemInfos.description),
    };
    //Validation
    try {
      await riskSchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await putPatientRecord(
        "/risk_factors",
        item.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "RISK FACTORS/PREVENTION"
      );
      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to update risk factor: ${err.message}`, {
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
          "/risk_factors",
          item.id,
          auth.authToken,
          socket,
          "RISK FACTORS/PREVENTION"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error unable to delete risk factor: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  return (
    itemInfos && (
      <tr className="risk__item">
        <td>
          {editVisible ? (
            <input
              type="text"
              value={itemInfos.description}
              onChange={handleChange}
              name="description"
              autoComplete="off"
            />
          ) : (
            itemInfos.description
          )}
        </td>
        <td>
          <em>
            {staffIdToTitleAndName(
              clinic.staffInfos,
              itemInfos.created_by_id,
              true
            )}
          </em>
        </td>
        <td>
          <em>{toLocalDate(itemInfos.date_created)}</em>
        </td>
        <td>
          <div className="risk__item-btn-container">
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

export default RiskItem;
