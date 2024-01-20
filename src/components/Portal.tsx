import { createPortal } from "react-dom";

export function Portal({ node, children }: { node: HTMLDivElement | null; children: React.ReactNode; }) {
    if (!node) return null;
    return createPortal(children, node);
}
