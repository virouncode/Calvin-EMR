import { Alert, AlertTitle, Snackbar } from "@mui/material";
import React from "react";

const AlertMsg = ({ severity, title, msg, open, setOpen }) => {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={setOpen}>
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {msg}
      </Alert>
    </Snackbar>
  );
};

export default AlertMsg;
