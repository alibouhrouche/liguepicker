// import { m } from "framer-motion";
import Card from "../components/Card";
import { Link } from "react-router-dom";
// import Cardview from "./cardview";
import { useEffect } from "react";
import { useGlobalContext } from "./GlobalContext";
import items from "./home.json"

export default function Home() {
    // const params = useParams();
    // const { id } = params;
    const ctx = useGlobalContext();
    useEffect(() => {
        ctx.setTitle("Home");
    })
    return (
        <section className="cards" 
        // initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            {items.map((item) => {
                return <Link to={item.href} key={item.id}>
                    <Card
                        id={item.id}
                        bg={item.thumbnail}
                        alt={item.alt}
                        title={item.title}
                        titleLink={item.titleLink}
                        desc={item.desc}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    />
                </Link>
            })}
            {/* <Link to={"/image/exif"}>
                <Card 
                    id="1"
                    bg="https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=640&q=80" 
                    alt="low-angle photography of metal structure"
                    title="Exif data Viewer"
                    titleLink=""
                    desc="Displaying the EXIF data of a photo."
                />
            </Link>
            <Link to={"/pdf/flat"}>
                <Card 
                    id="2"
                    bg="https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=640&q=80" 
                    alt="low-angle photography of metal structure"
                    title="Flatten PDF Forms"
                    titleLink=""
                    desc="Flatten PDF Forms."
                />
            </Link> */}
            {/* <AnimatePresence>
                { id && <Cardview />}
            </AnimatePresence> */}
        </section>
    )
}