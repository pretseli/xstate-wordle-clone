export default function Overlay({ children }) {
  return (
    <div
      style={{
        fontSize: "30px",
        display: "flex",
        position: "fixed",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>{children}</div>
    </div>
  );
}
