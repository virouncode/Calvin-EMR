import React from "react";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";

const FamilyDoctorListItem = ({ item, handleAddItemClick }) => {
  const { clinic } = useAuth();
  return (
    <tr className="doctors-list__item">
      <td>{item.name}</td>
      <td>{item.speciality}</td>
      <td>{item.licence_nbr}</td>
      <td>{item.address}</td>
      <td>{item.province_state}</td>
      <td>{item.postal_code}</td>
      <td>{item.city}</td>
      <td>{item.country}</td>
      <td>{item.phone}</td>
      <td>{item.fax}</td>
      <td>{item.email}</td>
      <td>{item.ohip_billing_nbr}</td>
      <td>
        <em>
          {staffIdToTitleAndName(clinic.staffInfos, item.created_by_id, true)}
        </em>
      </td>
      <td>
        <em>{toLocalDate(item.date_created)}</em>
      </td>
      <td>
        <button onClick={() => handleAddItemClick(item)}>Add to patient</button>
      </td>
    </tr>
  );
};

export default FamilyDoctorListItem;
