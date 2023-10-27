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
import { concernSchema } from "../../../../validation/concernValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const ConcernItem = ({ item, editCounter, setErrMsgPost }) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [itemInfos, setItemInfos] = useState(null);

  useEffect(() => {
    setItemInfos(item);
  }, [item]);

  //HANDLERS
  const handleEditClick = (e) => {
    editCounter.current += 1;
    setErrMsgPost("");
    setEditVisible((v) => !v);
  };

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
          "/ongoing_concerns",
          item.id,
          auth.authToken,
          socket,
          "ONGOING CONCERNS"
        );

        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error unable to delete ongoing concern: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

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
      description: firstLetterUpper(itemInfos.description),
    };
    setItemInfos({
      ...itemInfos,
      description: firstLetterUpper(itemInfos.description),
    });

    //Validation
    try {
      await concernSchema.validate(formDatas);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    try {
      await putPatientRecord(
        "/ongoing_concerns",
        item.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "ONGOING CONCERNS"
      );

      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to update ongoing concern: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    itemInfos && (
      <tr className="concerns__item">
        <td>
          {editVisible ? (
            <input
              name="description"
              onChange={handleChange}
              type="text"
              value={itemInfos.description}
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
        <td style={{ textAlign: "center" }}>
          <div className="concerns__item-btn-container">
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

export default ConcernItem;
