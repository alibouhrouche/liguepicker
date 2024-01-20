
export const ItemTypes = {
    ITEM: 'item'
};

export type ItemType = {
    id: number,
    inTable: true,
} | {
    id: number,
    inTable: false,
    value: number,
}
