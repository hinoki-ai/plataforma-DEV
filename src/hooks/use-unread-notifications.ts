import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSession } from "@/lib/auth-client"

export function useUnreadNotifications() {
  const { data: session } = useSession()
  const user = session?.user

  const unreadCount = user?.id
    ? useQuery(api.notifications.getUnreadCount, { recipientId: user.id })
    : null

  return {
    unreadCount: unreadCount ?? 0,
    hasUnread: (unreadCount ?? 0) > 0,
  }
}
