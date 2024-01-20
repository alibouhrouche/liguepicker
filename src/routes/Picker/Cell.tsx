import { css } from "@emotion/css"
// import { useAppContext } from "./Context"
import { useDrag } from 'react-dnd'
import { ItemTypes } from "./Constants"
import { m } from "framer-motion"
import { useAppContext } from "./Context"

const cellStyle = css`
  height: 5rem;
  width: 100%;
  flex-shrink: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--text2);
  font-weight: 700;
  text-align: center;
`

type Props = {
    id: number,
    state: "filled" | "empty",
    value?: string
}

export function DraggableCell({id, value, v}: Props & {v?: number}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ITEM,
    item: {
      id,
      inTable: id >= 0,
      value: v
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }))
    return (
      <div ref={drag} style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }} className={cellStyle}>{value}</div>
    )
}

export function DataCell({value}: {value: string}) {
  return (
    <div className={cellStyle}>{value}</div>
  )
}

export function RemCells({value, index, ...props}: {value: string, index: number} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
    >
      <DraggableCell id={-2} state="filled" value={value} v={index} />
    </div>
  )
}

export default function Cell({id, state, value}: Props) {
  const ctx = useAppContext()
  if (state === "filled") {
    return (
      <DraggableCell id={id} state={state} value={value} />
    )
  }
  return (
    <m.div className={cellStyle}
      style={{
        cursor: (ctx?.index ?? -1) < 0 || ctx?.disabled ? "default" : "pointer"
      }}
      whileHover={{
        backgroundColor: (ctx?.index ?? -1) < 0 || ctx?.disabled ? "rgba(0, 0, 0, 0.25)" :"rgba(204, 255, 0, 0.25)"
      }}
      onClick={() => {
        ctx?.add(id, ctx?.index)
      }}
    />
  )
}

