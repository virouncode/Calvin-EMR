import React from "react";
import VaccineCell from "./VaccineCell";

const VaccineItem = ({
  vaccineId,
  item,
  dose,
  ages,
  name,
  type,
  description,
  datas,
  patientInfos,
  setEditable,
  editable,
  setErrMsgPost,
}) => {
  //HOOKS

  return (
    <tr className="vaccines-item">
      <td>
        <div>
          <strong>{name}</strong>
        </div>
        <span style={{ fontSize: "0.7rem" }}>{description}</span>
      </td>
      {vaccineId !== 16 //not a pregnancy vaccine
        ? vaccineId !== 17 //not Influenza vaccine
          ? ages.map((age) => (
              <VaccineCell
                key={age}
                age={age}
                name={name}
                type={type}
                dose={dose}
                vaccineId={vaccineId}
                vaccineInfos={item.hasOwnProperty(`${age}`) ? item[age] : null}
                patientInfos={patientInfos}
                editable={editable}
                setEditable={setEditable}
                datas={datas}
                setErrMsgPost={setErrMsgPost}
              />
            ))
          : ages //Influenza vaccine
              .slice(0, ages.indexOf("6_months") + 1)
              .map((age) => (
                <VaccineCell
                  key={age}
                  age={age}
                  name={name}
                  type={type}
                  vaccineId={vaccineId}
                  dose={dose}
                  vaccineInfos={
                    item.hasOwnProperty(`${age}`) ? item[age] : null
                  }
                  patientInfos={patientInfos}
                  editable={editable}
                  setEditable={setEditable}
                  datas={datas}
                  setErrMsgPost={setErrMsgPost}
                />
              ))
        : ages //pregnancy vaccine
            .slice(0, ages.indexOf("grade_7") + 1)
            .map((age) => (
              <VaccineCell
                key={age}
                age={age}
                name={name}
                type={type}
                vaccineId={vaccineId}
                dose={dose}
                vaccineInfos={item.hasOwnProperty(`${age}`) ? item[age] : null}
                patientInfos={patientInfos}
                editable={editable}
                setEditable={setEditable}
                datas={datas}
                setErrMsgPost={setErrMsgPost}
              />
            ))}
    </tr>
  );
};

export default VaccineItem;
