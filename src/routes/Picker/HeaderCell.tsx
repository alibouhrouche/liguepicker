import { css } from "@emotion/css"

const HeaderStyle = css`
    background-color: #006a7c;
    color: #ffffff;
    padding: 20px 10px;
    border: 1px solid var(--text1);
`
type Props = {
    children?: React.ReactNode
}
export default function HeaderCell({ children }: Props) {
  return (
    <div className={HeaderStyle}>{children}</div>
  )
}
