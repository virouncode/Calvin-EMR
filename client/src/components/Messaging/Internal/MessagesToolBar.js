import React from "react";
import { toast } from "react-toastify";
import axiosXano from "../../../api/xano";
import useAuth from "../../../hooks/useAuth";
import { confirmAlert } from "../../Confirm/ConfirmGlobal";

const MessagesToolBar = ({
  search,
  setSearch,
  newVisible,
  setNewVisible,
  messages,
  section,
  setSection,
  msgsSelectedIds,
  setMsgsSelectedIds,
  currentMsgId,
  setPopUpVisible,
  selectAllVisible,
  setSelectAllVisible,
}) => {
  const { auth, user, socket } = useAuth();
  const handleChange = (e) => {
    setSearch(e.target.value);
  };
  const handleClickNew = (e) => {
    if (newVisible) {
      alert(
        "You already opened a New Message window, please send your message or close the window"
      );
      return;
    }
    setNewVisible(true);
  };

  const handleSelectAll = () => {
    const allMessagesIds = messages.map(({ id }) => id);
    setMsgsSelectedIds(allMessagesIds);
    setSelectAllVisible(false);
  };

  const handleUnselectAll = () => {
    setMsgsSelectedIds([]);
    setSelectAllVisible(true);
  };

  const handleDeleteSelected = async () => {
    if (
      await confirmAlert({
        content: "Do you really want to delete selected messages ?",
      })
    ) {
      try {
        for (let messageId of msgsSelectedIds) {
          //get the particular message
          const response = await axiosXano.get(`/messages/${messageId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          });
          const newMessage = {
            ...response.data,
            deleted_by_staff_ids: [
              ...response.data.deleted_by_staff_ids,
              user.id,
            ],
          };
          await axiosXano.put(`/messages/${messageId}`, newMessage, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          });
          socket.emit("message", {
            route: "MESSAGES INBOX",
            action: "update",
            content: { id: messageId, data: newMessage },
          });
        }
        setNewVisible(false);
        toast.success("Message(s) deleted successfully", { containerId: "A" });
        setMsgsSelectedIds([]);
        setSelectAllVisible(true);
      } catch (err) {
        toast.error(`Error: unable to delete message(s): ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  const handleClickMoveBack = async (e) => {
    try {
      const msgsSelected = (
        await axiosXano.post(
          "/messages_selected",
          { messages_ids: msgsSelectedIds },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data;
      for (let message of msgsSelected) {
        const newDeletedByStaffIds = message.deleted_by_staff_ids.filter(
          (id) => id !== user.id
        );
        const newMessage = {
          ...message,
          deleted_by_staff_ids: newDeletedByStaffIds,
        };
        await axiosXano.put(`/messages/${message.id}`, newMessage, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        });
        socket.emit("message", {
          route: "MESSAGES INBOX",
          action: "update",
          content: { id: message.id, data: newMessage },
        });
      }
      setSection("Inbox");
      setMsgsSelectedIds([]);
      setSelectAllVisible(true);
      toast.success("Message(s) undeleted successfully", {
        containerId: "A",
      });
    } catch (err) {
      toast.error(`Error: unable to undelete message(s): ${err.message}`, {
        containerId: "A",
      });
    }
  };

  // const handleClickSearch = (e) => {};
  const handleClickPrint = () => {
    setPopUpVisible(true);
  };

  return (
    <div className="messages-toolbar">
      <p className="messages-toolbar__title">Messaging</p>
      <input
        type="text"
        placeholder="Search in messages"
        value={search}
        onChange={handleChange}
        id="search"
      />
      <div className="messages-toolbar__btns">
        <button onClick={handleClickNew}>New</button>
        {section === "Deleted messages" && msgsSelectedIds.length !== 0 && (
          <button onClick={handleClickMoveBack}>Undelete</button>
        )}
        {currentMsgId !== 0 && (
          <button onClick={handleClickPrint}>Print</button>
        )}
        {section !== "Deleted messages" &&
          currentMsgId === 0 &&
          msgsSelectedIds.length !== 0 && (
            <button onClick={handleDeleteSelected}>Delete Selected</button>
          )}
        {currentMsgId === 0 &&
          (selectAllVisible ? (
            <button onClick={handleSelectAll}>Select All</button>
          ) : (
            <button onClick={handleUnselectAll}>Unselect All</button>
          ))}
      </div>
    </div>
  );
};

export default MessagesToolBar;
