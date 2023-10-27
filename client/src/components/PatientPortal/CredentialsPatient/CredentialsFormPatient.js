import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosXanoPatient from "../../../api/xanoPatient";
import useAuth from "../../../hooks/useAuth";

const CredentialsFormPatient = () => {
  const navigate = useNavigate();
  const { auth, user, socket } = useAuth();
  const [credentials, setCredentials] = useState({
    email: auth.email,
    password: "",
    confirmPassword: "",
  });
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const handleChange = (e) => {
    setErrMsg("");
    const name = e.target.name;
    const value = e.target.value;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.confirmPassword !== credentials.password) {
      setErrMsg("Passwords do not match");
      return;
    }
    try {
      const patients = await axiosXanoPatient.get("/patients", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });
      if (
        patients.data
          .filter(({ id }) => id !== user.id)
          .find(
            ({ email }) =>
              email.toLowerCase() === credentials.email.toLowerCase()
          )
      ) {
        setErrMsg(
          "There is already an account with this email, please choose another one"
        );
        return;
      }
    } catch (err) {
      setErrMsg(`Error: unable to change credentials: ${err.message}`);
      return;
    }

    try {
      //get patientInfo
      const me = (
        await axiosXanoPatient.get(`/patients/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        })
      ).data;
      me.email = credentials.email.toLowerCase();
      me.password = credentials.password;
      await axiosXanoPatient.put(`/patients/${user.id}`, me, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });
      socket.emit("message", {
        route: "PATIENTS",
        action: "update",
        content: { id: user.id, data: me },
      });
      socket.emit("message", {
        route: "USER",
        action: "update",
        content: { id: user.id, data: me },
      });
      setSuccessMsg("Credentials changed succesfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrMsg(`Error: unable to change credentials: ${err.message}`);
      return;
    }
  };

  return successMsg ? (
    <div className="credentials-success">{successMsg}</div>
  ) : (
    <>
      <form className="credentials-form" onSubmit={handleSubmit}>
        <div className="credentials-form-row">
          <label htmlFor="email">New email</label>
          <input
            id="email"
            type="email"
            onChange={handleChange}
            name="email"
            value={credentials.email}
            autoComplete="off"
            required
          />
        </div>
        <div className="credentials-form-row">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            onChange={handleChange}
            name="password"
            value={credentials.password}
            autoFocus
            autoComplete="off"
            required
          />
        </div>
        <div className="credentials-form-row">
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            onChange={handleChange}
            name="confirmPassword"
            value={credentials.confirmPassword}
            autoComplete="off"
            required
          />
        </div>
        <div className="credentials-form-row-submit">
          <button type="submit">Submit</button>
        </div>
      </form>
      {errMsg && <div className="credentials-err">{errMsg}</div>}
    </>
  );
};

export default CredentialsFormPatient;
