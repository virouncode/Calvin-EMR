import React from "react";
import { getVaccinationInterval } from "../../../../utils/getVaccinationInterval";
import VaccineCellItemDouble from "./VaccineCellItemDouble";
import VaccineCellItemMultiple from "./VaccineCellItemMultiple";
import VaccineCellItemSingle from "./VaccineCellItemSingle";

const VaccineCell = ({
  age,
  name,
  type,
  vaccineId,
  dose,
  vaccineInfos,
  patientInfos,
  editable,
  setEditable,
  datas,
  setErrMsgPost,
}) => {
  return vaccineInfos ? (
    <td colSpan={vaccineId === 16 ? "5" : vaccineId === 17 ? "10" : "0"}>
      {dose === "single" ? ( //single dose
        <VaccineCellItemSingle
          age={age}
          type={type}
          name={name}
          vaccineInfos={vaccineInfos}
          rangeStart={
            getVaccinationInterval(age, patientInfos.date_of_birth, name)
              .rangeStart
          }
          rangeEnd={
            getVaccinationInterval(age, patientInfos.date_of_birth, name)
              .rangeEnd
          }
          datas={datas}
          editable={editable}
          setEditable={setEditable}
          setErrMsgPost={setErrMsgPost}
        />
      ) : //double dose
      dose === "double" ? (
        <VaccineCellItemDouble
          age={age}
          name={name}
          type={type}
          vaccineInfos={vaccineInfos}
          patientInfos={patientInfos}
          datas={datas}
          editable={editable}
          setEditable={setEditable}
          setErrMsgPost={setErrMsgPost}
        />
      ) : (
        <VaccineCellItemMultiple
          age={age}
          name={name}
          vaccineInfos={vaccineInfos}
          datas={datas}
          editable={editable}
          setEditable={setEditable}
          setErrMsgPost={setErrMsgPost}
        />
      )}
    </td>
  ) : (
    <td className="vaccines-item__empty"></td> //not for this age
  );
};
export default VaccineCell;
