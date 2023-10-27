export const onMessageUser = (message, user, setUser) => {
  if (message.route !== "USER") return;
  setUser({ ...user, demographics: message.content.data });
  localStorage.setItem(
    "user",
    JSON.stringify({ ...user, demographics: message.content.data })
  );
};
