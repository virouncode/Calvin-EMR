import { getAppointmentProposal } from "./getAppoinmentProposal";

export const getAvailableAppointments = (
  availability,
  appointmentsInRange,
  practicianSelectedId,
  rangeStart
) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const defaulDurationMs =
    availability.default_duration_hours * 3600000 +
    availability.default_duration_min * 60000;

  //Si ça ne fait pas trois propositions je crée un nouveau jour
  const now = new Date();
  const today = now.getDay();
  let proposals = [];
  let newDay = (today + 1) % 7;

  while (newDay !== today) {
    while (availability.unavailability[days[newDay]] === true) {
      newDay = (newDay + 1) % 7;
    }
    const deltaNewDay =
      newDay - today > 0 ? newDay - today : 7 + (newDay - today);
    const appointmentProposal = getAppointmentProposal(
      availability,
      appointmentsInRange,
      days[newDay],
      deltaNewDay,
      defaulDurationMs,
      practicianSelectedId,
      rangeStart,
      newDay
    );

    if (appointmentProposal) proposals.push(appointmentProposal);
    newDay = (newDay + 1) % 7;
  }
  if (availability.unavailability[days[newDay]] === false) {
    const deltaNewDay =
      newDay - today > 0 ? newDay - today : 7 + (newDay - today);
    const appointmentProposal = getAppointmentProposal(
      availability,
      appointmentsInRange,
      days[newDay],
      deltaNewDay,
      defaulDurationMs,
      practicianSelectedId,
      rangeStart,
      newDay
    );

    if (appointmentProposal) proposals.push(appointmentProposal);
  }
  return proposals;
};
