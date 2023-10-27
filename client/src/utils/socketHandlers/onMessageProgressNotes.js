export const onMessageProgressNotes = (
  message,
  progressNotes,
  setProgressNotes,
  patientId,
  order
) => {
  if (
    message.route !== "PROGRESS NOTES" ||
    message.content.data.patient_id !== patientId
  )
    return;
  switch (message.action) {
    case "create":
      const newProgressNotes = [...progressNotes, message.content.data];
      order === "top"
        ? setProgressNotes(
            newProgressNotes.sort(
              (a, b) =>
                (b.date_updated ? b.date_updated : b.date_created) -
                (a.date_updated ? a.date_updated : a.date_created)
            )
          )
        : setProgressNotes(
            newProgressNotes.sort(
              (a, b) =>
                (a.date_updated ? a.date_updated : a.date_created) -
                (b.date_updated ? b.date_updated : b.date_created)
            )
          );
      break;
    case "update":
      const progressNotesUpdated = progressNotes.map((progressNote) =>
        progressNote.id === message.content.id
          ? message.content.data
          : progressNote
      );
      order === "top"
        ? setProgressNotes(
            progressNotesUpdated.sort(
              (a, b) =>
                (b.date_updated ? b.date_updated : b.date_created) -
                (a.date_updated ? a.date_updated : a.date_created)
            )
          )
        : setProgressNotes(
            progressNotesUpdated.sort(
              (a, b) =>
                (a.date_updated ? a.date_updated : a.date_created) -
                (b.date_updated ? b.date_updated : b.date_created)
            )
          );
      break;
    default:
      break;
  }
};
