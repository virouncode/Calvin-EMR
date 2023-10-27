import React from "react";
import { toast } from "react-toastify";
import { deletePatientRecord } from "../../../../api/fetchRecords";
import axiosXano from "../../../../api/xano";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const DocumentItem = ({ item, showDocument, setErrMsgPost }) => {
  const { auth, clinic, user, socket } = useAuth();

  const handleDeleteClick = async (e) => {
    setErrMsgPost("");
    if (
      await confirmAlert({
        content: "Do you really want to delete this item ?",
      })
    ) {
      try {
        await deletePatientRecord(
          "/documents",
          item.id,
          auth.authToken,
          socket,
          "DOCUMENTS"
        );
        socket.emit("message", {
          route: "DOCMAILBOX",
          action: "delete",
          content: { id: item.id },
        });
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error unable to delete document: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  const handleAcknowledge = async () => {
    if (
      await confirmAlert({
        content: "Do you really want to acknowledge this document ?",
      })
    ) {
      try {
        const datasToPut = { ...item };
        datasToPut.acknowledged = true;
        datasToPut.date_acknowledged = Date.now();
        await axiosXano.put(`documents/${item.id}`, datasToPut, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        });
        socket.emit("message", {
          route: "DOCUMENTS",
          action: "update",
          content: { id: item.id, data: datasToPut },
        });
        socket.emit("message", {
          route: "DOCMAILBOX",
          action: "update",
          content: { id: item.id, data: datasToPut },
        });
        toast.success("Document acknowledged successfully", {
          containerId: "A",
        });
      } catch (err) {
        toast.error(`Unable to acknowledge document : ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  return (
    <tr className="documents__item">
      <td
        className="documents__link"
        onClick={() => showDocument(item.file.url, item.file.mime)}
        style={{
          fontWeight: item.acknowledged ? "normal" : "bold",
          color: item.acknowledged ? "black" : "blue",
        }}
      >
        {item.description}
      </td>
      <td>{item.file.name}</td>
      <td>{item.file.type}</td>
      <td>
        <em>
          {staffIdToTitleAndName(clinic.staffInfos, item.created_by_id, true)}
        </em>
      </td>
      <td>
        <em>{toLocalDate(item.date_created)}</em>
      </td>
      <td className="documents__item-btn-container">
        {!item.acknowledged && item.assigned_id === user.id && (
          <button onClick={handleAcknowledge}>Acknowledge</button>
        )}
        <button>Fax</button>
        <button
          onClick={handleDeleteClick}
          disabled={user.id !== item.assigned_id}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default DocumentItem;
