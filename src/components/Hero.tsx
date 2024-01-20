import { HTMLMotionProps, MotionStyle, m } from "framer-motion";
import cssClass from "./Drop.module.scss";

type Props = {
    background: string;
    title: string;
    layoutId?: string;
    children?: React.ReactNode;
    style?: MotionStyle
}

export default function Hero({layoutId, background, style, ...props}: Props & HTMLMotionProps<"div">) {
  return (
    <m.div className={cssClass.heading} style={{
        'backgroundImage': `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 1)),url(${background})`,
        'backgroundSize': 'cover',
        'backgroundPosition': 'center',
        ...style
    }}
    // transition={{ type: "spring", stiffness: 400, damping: 17 }}
    {...props}>
        {props.children}
    </m.div>
  )
}
