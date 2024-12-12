

import { IconType } from "react-icons";



export function IconIllustration({ Icon }: { Icon: IconType }) {
    return <div className="grid">
        <Icon style={{ gridColumn: 1, gridRow: 1 }} className="text-[color:var(--primary)] w-20 h-20" />
        <Icon style={{ gridColumn: 1, gridRow: 1 }} className="w-16 h-16 text-[color:var(--secondary)] mt-5 mx-5 " />
    </div>
}