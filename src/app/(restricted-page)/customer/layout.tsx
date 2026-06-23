import { BottomNavigation } from "@/components/BottomNavigation"
import React, { PropsWithChildren } from "react"
import { Home, Pocket, Repeat, User } from "react-feather"

const items = [
  {
    route: "/customer",
    icon: <Home />,
  },
  {
    route: "/customer/history",
    icon: <Repeat />,
  },
  {
    route: "/customer/tree",
    icon: <Pocket />,
  },
  {
    route: "/customer/account",
    icon: <User />,
  },
]

const Layout = (props: PropsWithChildren) => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {props.children}
      </div>
      <BottomNavigation items={items} />
    </div>
  )
}

export default Layout
