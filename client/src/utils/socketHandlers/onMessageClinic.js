export const onMessageClinic = (message, clinic, setClinic) => {
  if (message.route !== "PATIENTS" && message.route !== "STAFF") return;
  if (message.route === "PATIENTS") {
    switch (message.action) {
      case "create":
        setClinic({
          ...clinic,
          patientsInfos: [...clinic.patientsInfos, message.content.data].sort(
            (a, b) => a.last_name.localeCompare(b.last_name)
          ),
        });
        localStorage.setItem(
          "clinic",
          JSON.stringify({
            ...clinic,
            patientsInfos: [...clinic.patientsInfos, message.content.data].sort(
              (a, b) => a.last_name.localeCompare(b.last_name)
            ),
          })
        );
        break;
      case "update":
        setClinic({
          ...clinic,
          patientsInfos: clinic.patientsInfos
            .map((patient) =>
              patient.id === message.content.id ? message.content.data : patient
            )
            .sort((a, b) => a.last_name.localeCompare(b.last_name)),
        });
        localStorage.setItem(
          "clinic",
          JSON.stringify({
            ...clinic,
            patientsInfos: clinic.patientsInfos
              .map((patient) =>
                patient.id === message.content.id
                  ? message.content.data
                  : patient
              )
              .sort((a, b) => a.last_name.localeCompare(b.last_name)),
          })
        );
        break;
      default:
        break;
    }
  } else if (message.route === "STAFF") {
    switch (message.action) {
      case "create":
        setClinic({
          ...clinic,
          staffInfos: [...clinic.staffInfos, message.content.data].sort(
            (a, b) => a.last_name.localeCompare(b.last_name)
          ),
        });
        localStorage.setItem(
          "clinic",
          JSON.stringify({
            ...clinic,
            staffInfos: [...clinic.staffInfos, message.content.data].sort(
              (a, b) => a.last_name.localeCompare(b.last_name)
            ),
          })
        );
        break;
      case "update":
        setClinic({
          ...clinic,
          staffInfos: clinic.staffInfos
            .map((staff) =>
              staff.id === message.content.id ? message.content.data : staff
            )
            .sort((a, b) => a.last_name.localeCompare(b.last_name)),
        });
        localStorage.setItem(
          "clinic",
          JSON.stringify({
            ...clinic,
            staffInfos: clinic.staffInfos
              .map((staff) =>
                staff.id === message.content.id ? message.content.data : staff
              )
              .sort((a, b) => a.last_name.localeCompare(b.last_name)),
          })
        );
        break;
      default:
        break;
    }
  }
};
