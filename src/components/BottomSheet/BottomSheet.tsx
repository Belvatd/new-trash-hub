"use client"

import { PropsWithChildren, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type TBottomSheet = {
  open?: boolean
  setOpen?: any
  closeOutside?: boolean
  className?: string
} & PropsWithChildren
export default function BottomSheet(props: TBottomSheet) {
  const { open, setOpen, children, className, closeOutside } = props
  const bottomSheetRef = useRef(null)
  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (closeOutside && ref.current && !ref.current.contains(event.target)) {
          setOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [ref])
  }
  useOutsideAlerter(bottomSheetRef)
  return (
    <div className="relative z-[9999]">
      <motion.div
        animate={
          open ? { opacity: 0.3, zIndex: 9998 } : { opacity: 0, display: "none" }
        }
        initial={{ opacity: 0 }}
        className="fixed bottom-0 top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-[360px] bg-black"
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { x: "-50%", y: 0, height: "auto" },
              collapsed: { x: "-50%", y: "100%", height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="fixed bottom-3 left-1/2 z-[9999] w-[calc(100%-24px)] max-w-[340px] rounded-3xl bg-white"
          >
            <div ref={bottomSheetRef} className={className}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
