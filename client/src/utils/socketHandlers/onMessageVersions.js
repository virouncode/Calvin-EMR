export const onMessageVersions = (
  message,
  versions,
  setVersions,
  progressNoteId
) => {
  if (message.route !== "VERSIONS") return;
  if (message.content.data[0].progress_note_id !== progressNoteId) return;
  setVersions(message.content.data);
};
