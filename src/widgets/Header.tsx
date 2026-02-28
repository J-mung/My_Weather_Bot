import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <header role="banner">
        <button title={"홈"} onClick={handleHome}>
          홈
        </button>
      </header>
    </>
  );
}
