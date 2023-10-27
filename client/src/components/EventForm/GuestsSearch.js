import React, { useState } from "react";
import GuestsSearchForm from "./GuestsSearchForm";
import GuestsSearchResults from "./GuestsSearchResults";

const GuestsSearch = ({
  handleAddGuest,
  staffInfos,
  patientsInfos,
  staffGuestsInfos,
  patientsGuestsInfos,
  hostId,
}) => {
  const [search, setSearch] = useState({
    name: "",
    email: "",
    phone: "",
    birth: "",
    chart: "",
    health: "",
  });

  return (
    <>
      <GuestsSearchForm search={search} setSearch={setSearch} />
      <GuestsSearchResults
        search={search}
        handleAddGuest={handleAddGuest}
        staffInfos={staffInfos}
        patientsInfos={patientsInfos}
        staffGuestsInfos={staffGuestsInfos}
        patientsGuestsInfos={patientsGuestsInfos}
        hostId={hostId}
      />
    </>
  );
};

export default GuestsSearch;
