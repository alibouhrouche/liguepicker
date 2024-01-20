import { HTMLMotionProps, m } from "framer-motion"
import { Link } from "react-router-dom"

type CardProps = {
    id: string,
    bg: string,
    alt: string,
    title: string,
    titleLink: string,
    desc: string,
}

function Card({ id, bg, alt, title, titleLink, desc, ...props }: CardProps & HTMLMotionProps<"div">) {
    return (
        <m.div className="card" layoutId={`card-container-${id}`} {...props}>
            <img src={bg} width="250" height="200" alt={alt} />
            <div className="content">
                <div className="authors"></div>
                <m.div className="title" layoutId={`card-title-${id}`}>
                    {titleLink ? <Link to={titleLink}>{title}</Link>
                    : title}
                    {/* <Link to={props.titleLink}>{props.title}</Link>  */}
                    {/* <a href="https://github.com/alibouhrouche/request-baskets" title="Source Code">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256">
                            <rect width="256" height="256" fill="none"></rect>
                            <polyline points="64 88 16 128 64 168" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline>
                            <polyline points="192 88 240 128 192 168" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline>
                            <line x1="160" y1="40" x2="96" y2="216" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line>
                        </svg>
                    </a> */}
                </m.div>
                <m.div className="desc" layoutId={`card-desc-${id}`}>{desc}</m.div>
                <div className="tags"></div>
            </div>
        </m.div>
    )
}

export default Card