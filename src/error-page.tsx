import { LazyMotion, m } from "framer-motion";
import { useEffect } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import ArrowLeft from "./components/ArrowLeft";

type routerError = {
    statusText: string;
    message: string;
}

const loadFeatures = () =>
  import("./motion").then(res => res.default)

export default function ErrorPage() {
    useEffect(() => {
        document.title = "Oops!";
    })
    const error = useRouteError() as routerError;
    console.error(error);
    const navigate = useNavigate();
    return (
        <LazyMotion features={loadFeatures} strict>
            <>
                <header>
                    <div className="header">
                    <m.div className="logo"
                        onClick={() => {
                        navigate(-1);
                        }}
                    >
                        <ArrowLeft />
                    </m.div>
                    <b>Oops!</b>
                    <nav>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="2rem"
                        ></svg>
                    </nav>
                    </div>
                </header>
                <main>
                    <m.section className="centered">
                        <div id="error-page">
                            <h1>Oops!</h1>
                            <p>Sorry, an unexpected error has occurred.</p>
                            <p>
                                <i>{error.statusText || error.message}</i>
                            </p>
                        </div>
                    </m.section>
                </main>
            </>
        </LazyMotion>
    );
}
