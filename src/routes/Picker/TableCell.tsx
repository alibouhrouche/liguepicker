import Cell from "./Cell"
import { useDrop } from 'react-dnd'
import { ItemType, ItemTypes } from "./Constants"
import { useAppContext } from "./Context"

type Props = {
  id: number,
  state: "filled" | "empty",
  list: string[],
  data: number[],
  value?: string
}
export default function TableCell({id, state, value}: Props) {
  const ctx = useAppContext()!
  const [{ isOver, canDrop }, drop] = useDrop<ItemType, unknown, {
    isOver: boolean,
    canDrop: boolean
  }>(() => ({
    accept: ItemTypes.ITEM,
    drop: (item) => {
      if (item.inTable)
        ctx.swap(item.id, id)
      else {
        ctx.add(id, item.value, item.id)
        // ctx.setState(-1)
        // ctx.setCellIndex(id, item.value)
      }
    },
    canDrop: (item) => item.inTable || ctx.isEmpty(id),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [id])
  const background = isOver
  ? (canDrop ? "rgba(204, 255, 0, 0.25)" : "rgba(255, 0, 0, 0.25)")
  : "var(--surface1)"
  return (
    <div ref={drop}
      style={{
        background,
        transition: "background 0.25s",
      }}
    >
      <Cell id={id} state={state} value={value} />
    </div>
  )
}
