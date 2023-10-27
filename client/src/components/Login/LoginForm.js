import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosXano from "../../api/xano";
import axiosXanoPatient from "../../api/xanoPatient";
import useAuth from "../../hooks/useAuth";
import {
  getUnreadMessagesExternalNbr,
  getUnreadMessagesNbr,
} from "../../utils/getUnreadMessagesNbr";
import { userSchema } from "../../validation/userValidation";

const LOGIN_URL = "/auth/login";
const USERINFO_URL = "/auth/me";

const LoginForm = () => {
  //HOOKS
  const { setAuth, setClinic, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [from, setFrom] = useState(location.state?.from?.pathname || "/"); //où on voulait aller ou calendar staff
  const [errMsg, setErrMsg] = useState("");
  const [formDatas, setFormDatas] = useState({
    email: "",
    password: "",
    type: "staff",
  });

  //HANDLERS
  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setErrMsg("");
    setFormDatas({ ...formDatas, [name]: value });
    if (value === "patient")
      setFrom(location.state?.from?.pathname || "/patient/messages"); //où on voulait aller ou messages patient
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validation
    try {
      await userSchema.validate(formDatas);
    } catch (err) {
      setErrMsg(err.message);
      return;
    }
    const formDatasToPost = {
      ...formDatas,
      email: formDatas.email.toLowerCase(),
    };
    //Submission
    const email = formDatasToPost.email;
    const password = formDatasToPost.password;
    if (formDatasToPost.type === "staff") {
      try {
        //=============== AUTH =================//
        const response = await axiosXano.post(
          LOGIN_URL,
          JSON.stringify({ email, password }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const authToken = response?.data?.authToken;
        setAuth({ email, authToken });
        localStorage.setItem("auth", JSON.stringify({ email, authToken }));

        //================ USER ===================//
        const response2 = await axiosXano.get(USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const accessLevel = response2?.data?.access_level;
        const id = response2?.data?.id;
        const name = response2?.data?.full_name;
        const title = response2?.data?.title;
        const sign = response2?.data?.sign;
        const licence_nbr = response2?.data?.licence_nbr;
        const ai_consent = response2?.data?.ai_consent;
        //Get user settings
        const response3 = await axiosXano.get(`/settings?staff_id=${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const settings = response3?.data;
        // Get user unread messages
        const response4 = await axiosXano.get(`/messages?staff_id=${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        const unreadMessagesNbr = getUnreadMessagesNbr(response4.data, id);

        // Get user unread external messages
        const response5 = await axiosXano.get(
          `/messages_external_for_staff?staff_id=${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const unreadMessagesExternalNbr = getUnreadMessagesExternalNbr(
          response5.data,
          "staff",
          id
        );
        const unreadNbr = unreadMessagesExternalNbr + unreadMessagesNbr;

        setUser({
          accessLevel,
          id,
          name,
          title,
          sign,
          licence_nbr,
          ai_consent,
          settings,
          unreadMessagesNbr,
          unreadMessagesExternalNbr,
          unreadNbr,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            accessLevel,
            id,
            name,
            title,
            sign,
            licence_nbr,
            ai_consent,
            settings,
            unreadMessagesNbr,
            unreadMessagesExternalNbr,
            unreadNbr,
          })
        );

        //================== CLINIC ===================//
        const response6 = await axiosXano.get("/staff", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const staffInfos = response6.data.sort((a, b) =>
          a.last_name.localeCompare(b.last_name)
        );

        const response7 = await axiosXano.get("/patients", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const patientsInfos = response7.data.sort((a, b) =>
          a.last_name.localeCompare(b.last_name)
        );
        setClinic({ staffInfos, patientsInfos });
        localStorage.setItem(
          "clinic",
          JSON.stringify({
            staffInfos,
            patientsInfos,
          })
        );
        navigate(from, { replace: true }); //on renvoit vers là où on voulait aller
      } catch (err) {
        if (!err?.response) {
          setErrMsg("No server response");
        } else if (err.response?.response?.status === 400) {
          setErrMsg("Missing email or password");
        } else if (err.response?.response?.status === 401) {
          setErrMsg("Unhauthorized");
        } else {
          setErrMsg("Login failed, please try again");
        }
      }
    } else {
      //PATIENT
      try {
        //=============== AUTH =================//
        const response = await axiosXanoPatient.post(
          LOGIN_URL,
          JSON.stringify({ email, password }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const authToken = response?.data?.authToken;
        setAuth({ email, authToken });
        localStorage.setItem("auth", JSON.stringify({ email, authToken }));

        //================ USER ===================//
        const response2 = await axiosXanoPatient.get(USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const id = response2?.data?.id;
        const name = response2?.data?.full_name;
        const accessLevel = response2?.data?.access_level;
        const demographics = response2?.data;

        // Get user unread messages
        const response3 = await axiosXanoPatient.get(
          `/messages_external_for_patient?patient_id=${demographics.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const unreadMessagesExternalNbr = getUnreadMessagesExternalNbr(
          response3.data,
          "patient",
          id
        );
        const unreadNbr = unreadMessagesExternalNbr;

        setUser({
          id,
          name,
          accessLevel,
          demographics,
          unreadNbr,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            id,
            name,
            accessLevel,
            demographics,
            unreadNbr,
          })
        );

        //================== CLINIC ===================//
        const response4 = await axiosXanoPatient.get("/staff", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const staffInfos = response4.data.sort((a, b) =>
          a.last_name.localeCompare(b.last_name)
        );

        const response5 = await axiosXanoPatient.get("/patients", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const patientsInfos = response5.data.sort((a, b) =>
          a.last_name.localeCompare(b.last_name)
        );
        setClinic({ staffInfos, patientsInfos });
        localStorage.setItem(
          "clinic",
          JSON.stringify({ staffInfos, patientsInfos })
        );
        navigate(from, { replace: true });
      } catch (err) {
        if (!err?.response) {
          setErrMsg("No server response");
        } else if (err.response?.response?.status === 400) {
          setErrMsg("Missing email or password");
        } else if (err.response?.response?.status === 401) {
          setErrMsg("Unhauthorized");
        } else {
          setErrMsg("Login failed, please try again");
        }
      }
    }
  };

  const handleClickForgot = () => {
    navigate("/reset-password");
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <p className="login-title">Welcome to Calvin EMR</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-row-radio">
            <div className="login-form-row-radio-item">
              <input
                type="radio"
                id="staff"
                name="type"
                value="staff"
                checked={formDatas.type === "staff"}
                onChange={handleChange}
              />
              <label htmlFor="staff">Staff</label>
            </div>
            <div className="login-form-row-radio-item">
              <input
                type="radio"
                id="patient"
                name="type"
                value="patient"
                checked={formDatas.type === "patient"}
                onChange={handleChange}
              />
              <label htmlFor="patient">Patient</label>
            </div>
          </div>
          {errMsg && <p className={"login-errmsg"}>{errMsg}</p>}
          <div className="login-form-row">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              autoComplete="off"
              onChange={handleChange}
              value={formDatas.email}
              autoFocus
            />
          </div>
          <div className="login-form-row">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              value={formDatas.password}
              autoComplete="off"
            />
          </div>
          <button>Sign In</button>
        </form>
        <p className="login-forgot">
          <span
            onClick={handleClickForgot}
            style={{ textDecoration: "underline", cursor: "pointer" }}
          >
            I forgot my password
          </span>
        </p>
      </div>
    </div>
  );
};
export default LoginForm;
