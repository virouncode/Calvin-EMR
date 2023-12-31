import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosXano from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { linkSchema } from "../../validation/linkValidation";

const LinkEdit = ({ link, myLinks, setEditVisible }) => {
  const [errMsg, setErrMsg] = useState("");
  const [editedLink, setEditedLink] = useState(link);
  const { auth, socket, user, clinic } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validation
    try {
      await linkSchema.validate(editedLink);
    } catch (err) {
      setErrMsg(err.message);
      return;
    }
    if (
      myLinks.find(({ name }) => name === editedLink.name && name !== link.name)
    ) {
      setErrMsg("You already have a link with this name");
      return;
    }
    let urlFormatted = editedLink.url;
    if (!editedLink.url.includes("http") || !editedLink.url.includes("https")) {
      urlFormatted = ["https://", editedLink.url].join("");
    }
    try {
      const userInfos = clinic.staffInfos.find(({ id }) => id === user.id);
      const datasToPut = {
        ...userInfos,
        links: myLinks.map((item) =>
          item.name === link.name
            ? { name: editedLink.name, url: urlFormatted }
            : item
        ),
      };
      await axiosXano.put(`/staff/${user.id}`, datasToPut, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });
      setEditVisible(false);
      socket.emit("message", {
        route: "STAFF",
        action: "update",
        content: { id: user.id, data: datasToPut },
      });
      toast.success("Saved successfully", { containerId: "A" });
    } catch (err) {
      toast.error(`Unable to save link:${err.message}`);
    }
  };
  const handleChange = (e) => {
    setErrMsg("");
    const name = e.target.id;
    const value = e.target.value;
    setEditedLink({ ...editedLink, [name]: value });
  };
  const handleCancel = () => {
    setEditVisible(false);
  };
  return (
    <form className="reference__form" onSubmit={handleSubmit}>
      {errMsg && <p className="reference__form-err">{errMsg}</p>}
      <div className="reference__form-row">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          value={editedLink.name}
          id="name"
          onChange={handleChange}
          autoComplete="off"
          autoFocus
        />
      </div>
      <div className="reference__form-row">
        <label htmlFor="url">URL</label>
        <input
          type="text"
          value={editedLink.url}
          id="url"
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      <div className="reference__form-btns">
        <input type="submit" value="Save" />
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default LinkEdit;
