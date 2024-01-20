import ArrowLeft from '../components/ArrowLeft';
import { Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import Loader from "../components/Loader";
import { GlobalContext } from "./GlobalContext";

const loadFeatures = () =>
  import("../motion").then(res => res.default)

export default function Root() {
  const [title, setTitle] = useState("Hey");
  const [fullWidth, setFullWidth] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const extra = useRef(null);
  useEffect(() => {
    document.title = title;
  }, [title]);
  const navigate = useNavigate();
  const navigation = useNavigation();
  return (
    <LazyMotion features={loadFeatures} strict>
    <>
      <header className={hideHeader ? "hideHeader" : ""}>
        <div className="header">
          <m.div className="logo"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft />
            {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="2rem"></svg> */}
          </m.div>
          <b style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}>{title}</b>
          <div ref={extra}></div>
          {/* <nav>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="2rem"
            ></svg> */}
            {/* {% for item in navigation.items %}
                    {% if item.url == '/' and page.url != '/' %}
                    <a href="{{ item.url }}">{{ item.text }}</a>
                    {% elif item.url in page.url %}
                    <span class=active>{{ item.text }}</span>
                    {% else %}
                    <a href="{{ item.url }}">{{ item.text }}</a>
                    {% endif %}
                    {% endfor %} */}
          {/* </nav> */}
        </div>
      </header>
      <GlobalContext.Provider value={{ setTitle,
      extra,
      fullWidth: (x)=>{
        // const oldFullWidth = fullWidth;
        setFullWidth(x);
        return () => setFullWidth(false);
      }, hideHeader: (hide) => {
        // const oldHideHeader = hideHeader;
        setHideHeader(hide);
        return () => setHideHeader(false);
      } }}>
        <AnimatePresence>
          <main className={`${fullWidth ? "fullWidth" : ""}`}>
            {navigation.state === "loading" && (
              <m.div className="overlay" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut"
                }}  
              >
                <Loader className="loader" />
              </m.div>
            )}
            <Outlet />
          </main>
        </AnimatePresence>
      </GlobalContext.Provider>
      <footer></footer>
    </>
    </LazyMotion>
  );
}
