import { css } from "@emotion/css"
import { animate } from "framer-motion"
import { useEffect } from "react"
import { useDrag } from "react-dnd"
import { ItemTypes } from "./Constants"
import { useAppContext } from "./Context"

type Props = {
    list: string[],
    id: number,
    rolling: boolean,
    disabled: boolean,
    loading: boolean,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    onFinish: () => void,
}

const cellStyle = css`
  height: 5rem;
  width: 100%;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--text2);
  text-align: center;
  font-weight: 700;
`

export default function RollingCell({ list, id, loading, setLoading, rolling, disabled, onFinish }: Props) {
    const {currText, setCurrText} = useAppContext()!
    useEffect(() => {
        let i = -1
        const max = Math.min(25, list.length)
        if (rolling && !disabled)
            animate(0, max, {
                duration: Math.min(5, max*0.5),
                ease: "easeInOut",
                repeat: 0,
                onUpdate: (v) => {
                    const n = Math.round(v)
                    setLoading(true)
                    if(i !== n) {
                        i = n
                        const index = (list.length < 25 ? list.length : 25) - n
                        setCurrText(list[index] ?? currText)
                    }
                },
                onComplete: () => {
                    setLoading(false)
                    onFinish()
                }
            })
    }, [rolling, disabled])
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ITEM,
        item: {
          id: -1,
          inTable: false,
          value: id
        },
        canDrag: !loading && !disabled && list.length > 0,
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging()
        })
      }), [loading, disabled, list])
    return (
        <div ref={drag} className={cellStyle}
            style={{
                opacity: loading || isDragging || disabled ? 0.5 : 1,
                cursor: loading || disabled ? 'default' : 'grab'
            }}
        >
            <span>{currText}</span>
            {/* <AnimatePresence>
                {hide || (!disabled && list.length === 0) ? <m.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >&nbsp;</m.span> : <m.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >{currText}</m.span>}
            </AnimatePresence> */}
        </div>
    )
}
