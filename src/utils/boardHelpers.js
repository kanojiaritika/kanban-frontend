export const boardAccents = [
  { bg: "bg-blue-500", soft: "bg-blue-500/10", text: "text-blue-500" },
  { bg: "bg-violet-500", soft: "bg-violet-500/10", text: "text-violet-500" },
  { bg: "bg-teal-500", soft: "bg-teal-500/10", text: "text-teal-500" },
  { bg: "bg-amber-500", soft: "bg-amber-500/10", text: "text-amber-500" },
  { bg: "bg-rose-500", soft: "bg-rose-500/10", text: "text-rose-500" },
  { bg: "bg-emerald-500", soft: "bg-emerald-500/10", text: "text-emerald-500" },
];

export const getAccent = (board) => {
  const key = String(board?.id ?? board?.title ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return boardAccents[Math.abs(hash) % boardAccents.length];
};

export const getMemberName = (member) =>
    member?.firstName
        ? `${member.firstName} ${member.lastName || ""}`.trim()
        : member?.emailId || member?.email || "Unknown";

export const getMemberRole = (member) => member?.role || "MEMBER";

// Looks up the CURRENT user's role on a given board, from board.members
export const getUserRoleOnBoard = (board, userEmail) => {
    if (!userEmail) return null;
    const member = (board?.members || []).find((m) => m.emailId === userEmail);
    const userRole = 
    console.log("Full board object:", JSON.stringify(board, null, 2));
    console.log("Looking for:", JSON.stringify(userEmail));
    console.log("Members list:", JSON.stringify(board?.members));
    console.log(`Member Role : ${member}`)
    return member?.role || null;
};

export const getCurrentUserRole = (board) => board?.userRole || null;

export const roleOptions = [
    { value: "MEMBER", label: "MEMBER" },
    { value: "ADMIN", label: "ADMIN" },
    { value: "OWNER", label: "OWNER" },
];

export const getSelectStyles = (isDark) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDark ? "#171717" : "#f9fafb",
        borderColor: state.isFocused ? "#2563eb" : isDark ? "#404040" : "#e5e5e5",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(37,99,235,0.3)" : "none",
        borderRadius: "0.5rem",
        minHeight: "40px",
        "&:hover": { borderColor: "#2563eb" },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: isDark ? "#171717" : "#ffffff",
        border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? (isDark ? "#262626" : "#eff6ff") : "transparent",
        color: isDark ? "#e5e5e5" : "#171717",
        cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: isDark ? "#e5e5e5" : "#171717" }),
    input: (base) => ({ ...base, color: isDark ? "#e5e5e5" : "#171717" }),
    placeholder: (base) => ({ ...base, color: isDark ? "#737373" : "#a3a3a3" }),
});