import { m } from "framer-motion";
export default function ArrowLeft() {
  return (
    <m.svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5rem"
      height="2rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        outline: "none",
      }}
      whileHover={{
        scale: 1.1,
      }}
      whileTap={{
        scale: 0.75,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      <m.path d="M19 12H6M12 5l-7 7 7 7" />
    </m.svg>
  );
}
