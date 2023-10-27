import React from "react";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";

const PharmacyListItem = ({ item, handleAddItemClick }) => {
  const { clinic } = useAuth();
  return (
    <tr className="pharmacies-list__item">
      <td>{item.name}</td>
      <td>{item.address}</td>
      <td>{item.province_state}</td>
      <td>{item.postal_code}</td>
      <td>{item.city}</td>
      <td>{item.country}</td>
      <td>{item.phone}</td>
      <td>{item.fax}</td>
      <td>{item.email}</td>
      <td>
        <em>
          {staffIdToTitleAndName(clinic.staffInfos, item.created_by_id, true)}
        </em>
      </td>
      <td>
        <em>{toLocalDate(item.date_created)}</em>
      </td>
      <td>
        <button onClick={() => handleAddItemClick(item)}>Add To Patient</button>
      </td>
    </tr>
  );
};

export default PharmacyListItem;
