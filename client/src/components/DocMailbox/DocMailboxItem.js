//Librairies
import React from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import axiosXano from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { toLocalDate } from "../../utils/formatDates";
import { patientIdToName } from "../../utils/patientIdToName";
import { staffIdToTitleAndName } from "../../utils/staffIdToTitleAndName";
import { confirmAlert } from "../Confirm/ConfirmGlobal";

const DocMailboxItem = ({
  item,
  showDocument,
  setDocuments,
  setForwardVisible,
  forwardVisible,
}) => {
  const { clinic, auth, user, setUser, socket } = useAuth();

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

        // const response = await axiosXano.get(
        //   `/documents_for_staff?staff_id=${user.id}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${auth.authToken}`,
        //     },
        //   }
        // );
        // setDocuments(response.data.filter(({ acknowledged }) => !acknowledged));
        toast.success("Document acknowledged successfully", {
          containerId: "A",
        });
      } catch (err) {
        toast.error(`Unable to Acknowledge document : ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  const handleForward = () => {
    setForwardVisible(true);
    setUser({ ...user, docToForward: item });
  };

  return (
    <tr className="documents__item">
      <td
        className="documents__link"
        onClick={() => showDocument(item.file.url, item.file.mime)}
      >
        {item.description}
      </td>
      <td>{item.file.name}</td>
      <td>{item.file.type}</td>
      <td>
        <NavLink
          className="documents__link"
          to={`/patient-record/${item.patient_id}`}
          target="_blank"
        >
          {" "}
          {patientIdToName(clinic.patientsInfos, item.patient_id)}
        </NavLink>
      </td>
      <td>
        <em>
          {staffIdToTitleAndName(clinic.staffInfos, item.created_by_id, true)}
        </em>
      </td>
      <td>
        <em>{toLocalDate(item.date_created)}</em>
      </td>
      <td className="documents__item-btn-container">
        <button onClick={handleAcknowledge}>Acknowledge</button>
        <button onClick={handleForward} disabled={forwardVisible}>
          Forward
        </button>
      </td>
    </tr>
  );
};

export default DocMailboxItem;
