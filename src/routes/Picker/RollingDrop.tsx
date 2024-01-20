import { useDrop } from "react-dnd"
import { ItemType, ItemTypes } from "./Constants"
import { useAppContext } from "./Context"
import RollingCell from "./RollingCell"

type Props = {
    list: string[],
    id: number,
    rolling: boolean,
    disabled: boolean,
    loading: boolean,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    onFinish: () => void,
}

export default function RollingDrop({ list, id, loading, setLoading, rolling, disabled, onFinish }: Props) {
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
    }), [id])
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
            <RollingCell list={list} id={id} loading={loading} setLoading={setLoading} rolling={rolling} disabled={disabled} onFinish={onFinish}/>
        </div>
    )
}
