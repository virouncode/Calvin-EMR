import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosXanoReset from "../../api/xanoReset";

const ResetPasswordForm = ({
  setErrMsg,
  setSuccesMsg,
  setResetOk,
  type,
  tempToken,
}) => {
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const navigate = useNavigate();
  const handleSubmitPwd = async (e) => {
    e.preventDefault();
    if (pwd !== confirmPwd) {
      setErrMsg("Passwords do not match");
      return;
    }
    try {
      await axiosXanoReset.post(
        `/auth/${type}/reset_password`,
        { password: pwd, confirm_password: confirmPwd },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );
      setSuccesMsg(
        "Your password has been reset successfully, we will redirect you to the login page"
      );
      setResetOk(true);
      setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      setErrMsg(`Unable to reset password: ${err.message}`);
    }
  };
  return (
    <form onSubmit={handleSubmitPwd} className="reset-password-form">
      <div className="reset-password-form-row">
        <label htmlFor="new-password">Enter a new password:</label>
        <input
          type="password"
          id="new-password"
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setErrMsg("");
          }}
          required
          autoComplete="off"
        />
      </div>
      <div className="reset-password-form-row">
        <label htmlFor="confirm-password">Confirm new password:</label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPwd}
          onChange={(e) => {
            setConfirmPwd(e.target.value);
            setErrMsg("");
          }}
          required
          autoComplete="off"
        />
      </div>
      <div className="reset-password-form-row-btn">
        <input type="submit" value="Submit" />
      </div>
    </form>
  );
};

export default ResetPasswordForm;
