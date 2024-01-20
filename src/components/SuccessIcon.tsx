import { m } from "framer-motion";

export function SuccessIcon() {
  return <svg style={{
    color: '#2ccc00',
    fill: 'none',
    width: "100%",
    height: "80px",
    // 'marginBottom': "40px",
    display: 'block'
  }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <m.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></m.path>
    <m.polyline initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }} transition={{
            duration: 0.5, type: "tween", ease: "easeIn"
          }} points="9 11.01 12 14.01 22 4"></m.polyline>
  </svg>;
}
  