import React, { useState } from "react";
import { toast } from "react-toastify";
import { putPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { getVaccinationLogo } from "../../../../utils/getVaccinationLogo";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";
import VaccineForm from "./VaccineForm";

const VaccineCellItemSingle = ({
  age,
  type,
  name,
  vaccineInfos,
  rangeStart,
  rangeEnd,
  datas,
  editable,
  setEditable,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [formVisible, setFormVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState([0, 0]);

  //STYLES
  const INTERVAL_STYLE = {
    color: rangeEnd < new Date() ? "crimson" : "black",
  };

  //HANDLERS
  const handleCheck = async (e) => {
    setErrMsgPost("");
    const checked = e.target.checked;
    if (checked) {
      setFormVisible(true);
      setScrollPosition([
        e.nativeEvent.view.scrollX,
        e.nativeEvent.view.scrollY,
      ]);
      setEditable(false);
    } else {
      if (
        await confirmAlert({
          content:
            "Do you really want to remove this vaccination ? ( vaccination date will be lost)",
        })
      ) {
        const newDatas = { ...datas };
        newDatas[name][age] = {
          vaccine_date: null,
          date_created: Date.now(),
          created_by_id: user.id,
        };
        try {
          await putPatientRecord(
            "/vaccines",
            datas.id,
            user.id,
            auth.authToken,
            newDatas,
            socket,
            "VACCINES"
          );
          toast.success("Saved successfully", { containerId: "B" });
        } catch (err) {
          toast.error(`Error unable to save vaccine: ${err.message}`, {
            containerId: "B",
          });
        }
      }
    }
  };

  const isChecked = () => {
    return vaccineInfos.vaccine_date ? true : false;
  };

  return (
    <div className="vaccines-item__cell">
      <input
        type="checkbox"
        onChange={handleCheck}
        name={name}
        checked={isChecked()}
        disabled={!editable}
      />
      {vaccineInfos.vaccine_date ? (
        <label className="vaccines-item__checked">
          {toLocalDate(vaccineInfos.vaccine_date)} {getVaccinationLogo(type)}
        </label>
      ) : (
        <label>
          <span style={INTERVAL_STYLE}>
            {age === "grade_7"
              ? `Grade 7 to 12 (til ${toLocalDate(rangeEnd)})`
              : `${toLocalDate(rangeStart)} to ${toLocalDate(rangeEnd)}`}
          </span>{" "}
          {getVaccinationLogo(type)}
        </label>
      )}
      {formVisible && (
        <VaccineForm
          setFormVisible={setFormVisible}
          setEditable={setEditable}
          datas={datas}
          scrollPosition={scrollPosition}
          name={name}
          age={age}
        />
      )}
    </div>
  );
};

export default VaccineCellItemSingle;
