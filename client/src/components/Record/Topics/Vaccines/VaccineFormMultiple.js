import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { putPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";

const VaccineFormMultiple = ({
  setFormVisible,
  setEditable,
  name,
  age,
  datas,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [formDatas, setFormDatas] = useState(datas);
  useEffect(() => {
    formDatas[name][age].push({
      vaccine_date: "",
      date_created: null,
      created_by_id: user.id,
    }); // eslint-disable-next-line
  }, []);

  //STYLE
  const FORM_STYLE = {
    position: "absolute",
    top: 700 / 2,
    left: 1400 / 2,
    transform: "translate(-50%,-50%)",
    background: "#FEFEFE",
    width: "300px",
    height: "100px",
    zIndex: "1000",
    border: "solid 1px #cecdcd",
    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  //HANDLERS
  const handleCancel = () => {
    setFormVisible(false);
    setEditable(true);
    const array = formDatas[name][age];
    array.pop();
    setFormDatas({
      ...formDatas,
      [name]: {
        ...formDatas[name],
        [age]: array,
      },
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await putPatientRecord(
        "/vaccines",
        formDatas.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "VACCINES"
      );
      setFormVisible(false);
      setEditable(true);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to save vaccine: ${err.message}`, {
        containerId: "B",
      });
    }
  };
  const handleChange = (e) => {
    setErrMsgPost("");
    const value = e.target.value;
    const array = formDatas[name][age];
    array[array.length - 1] = {
      vaccine_date: Date.parse(value),
      date_created: Date.now(),
      created_by_id: user.id,
    };
    setFormDatas({
      ...formDatas,
      [name]: {
        ...formDatas[name],
        [age]: array,
      },
    });
  };
  return (
    <div style={FORM_STYLE}>
      <form
        style={{ width: "100%" }}
        onSubmit={handleSubmit}
        className="vaccines-form"
      >
        <div className="vaccines-form__row1">
          {" "}
          <label>Date of vaccination: </label>
          <input
            type="date"
            value={
              formDatas[name][age]?.slice(-1)[0]?.vaccine_date
                ? toLocalDate(formDatas[name][age].slice(-1)[0].vaccine_date)
                : toLocalDate(new Date())
            }
            onChange={handleChange}
            required
          />
        </div>
        <div className="vaccines-form__row2">
          {" "}
          <input type="submit" value="Save" />
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VaccineFormMultiple;
