import { useDrop } from "react-dnd"
import { useAppContext } from "./Context"
import { ItemType, ItemTypes } from "./Constants"

export default function DropCell({children}: {children: React.ReactNode}) {
    const ctx = useAppContext()!
    const [{ isOver, canDrop }, drop] = useDrop<ItemType, unknown, {
        isOver: boolean,
        canDrop: boolean
    }>(() => ({
        accept: ItemTypes.ITEM,
        drop: (item) => {
            if (item.inTable)
                ctx.del(item.id)
        },
        canDrop: (item) => item.inTable && !ctx.rolling,
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }), [])
    const background = isOver
    ? (canDrop ? "rgba(204, 255, 0, 0.25)" : "rgba(255, 0, 0, 0.25)")
    : "var(--surface1)"
    return (
        <div ref={drop} style={{
            width: "100%",
            flexShrink: 0,
            background,
            transition: "background 0.25s",
        }}>
            {children}
        </div>
    )
}
