import type { Metadata } from "next"
import { Suspense } from "react"

import { CallbackProcessor } from "@/app/auth/callback/callback-processor"

export const metadata: Metadata = {
  title: "Memproses Login",
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackProcessor />
    </Suspense>
  )
}
