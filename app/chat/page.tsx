"use client"

import {useState, useEffect, useRef} from "react"
// Removed nekosapi import; will use direct fetch
import {Client} from "@stomp/stompjs"
import SockJS from "sockjs-client"
import {useRouter} from "next/navigation"
import {motion, AnimatePresence} from "framer-motion"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
  Send,
  Paperclip,
  Mic,
  Search,
  MoreVertical,
  Phone,
  Video,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Bell,
  BellOff,
} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {MessageNotification} from "@/components/MessageNotification"
import {ResizablePanel} from "@/components/ResizablePanel"

interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount: number
}

interface Message {
  id: string
  text: string
  sender: "user" | "contact"
  timestamp: string
  status: "sent" | "delivered" | "seen"
  type: "text" | "image" | "file"
  fileUrl?: string // Optional: file/image download or preview URL
}

export default function ChatPage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    "http://localhost:8080"
  // Logout handler
  // Store the number of contacts fetched
  const [contactsCount, setContactsCount] = useState(0)
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userId")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/auth/login")
  }
  // Track if running on client to safely use window
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  // WebSocket client state
  const stompClientRef = useRef<Client | null>(null)
  // Store chatId for the selected chat
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [nekoImageUrl, setNekoImageUrl] = useState<string>("")
  const [message, setMessage] = useState("")
  // File input ref for upload
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Handle Paperclip click
  const handlePaperclipClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // reset so same file can be selected again
      fileInputRef.current.click()
    }
  }

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file || !selectedChatId) return
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        title: "Missing token",
        description: "User token not found in localStorage.",
        variant: "destructive",
      })
      return
    }
    const formData = new FormData()
    formData.append("chat-id", selectedChatId)
    formData.append("file", file)
    // Only upload file, do not update messages here; rely on WebSocket for message delivery
    try {
      const res = await fetch(`${backendUrl}/api/v1/messages/upload-media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!res.ok) throw new Error("Failed to upload file")
      toast({
        title: "File uploaded",
        description: file.name,
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: "Upload failed",
        description:
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "Unknown error",
        variant: "destructive",
      })
    }
  }

  // Setup WebSocket connection only once on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!token || !userId) return

    // Connect only once
    if (stompClientRef.current) return

    const socketUrl = `${backendUrl}/ws`
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      debug: function () {},
      reconnectDelay: 5000,
    })
    stompClientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      stompClientRef.current = null
    }
  }, [])

  // Subscribe to personal queue when userId, selectedChatId, or selectedContact changes
  useEffect(() => {
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!userId) return
    if (!stompClientRef.current || !stompClientRef.current.connected) return

    let subscription = stompClientRef.current.subscribe(
      `/user/${userId}/queue/messages`,
      (message) => {
        try {
          const msgData = JSON.parse(message.body)
          // Handle typing event
          if (msgData.event === "typing" && msgData.senderId) {
            setContactTyping(msgData.senderId)
            setTimeout(() => setContactTyping(null), 2000) // Remove after 2s
            return
          }
          // Determine type and fileUrl for file/image messages
          let type: "text" | "image" | "file" = "text"
          let fileUrl: string | undefined = undefined
          if (msgData.mediaUrl && msgData.type) {
            const lowerType = msgData.type.toLowerCase()
            if (lowerType === "image") {
              type = "image"
              fileUrl = msgData.mediaUrl
            } else if (lowerType === "file") {
              type = "file"
              fileUrl = msgData.mediaUrl
            }
          }
          // Fix: set sender to 'user' if senderId matches current userId
          const senderType = msgData.senderId === userId ? "user" : "contact"
          setMessages((prev) => [
            ...prev,
            {
              id: msgData.id || Date.now().toString(),
              text: msgData.content || msgData.fileName || "",
              sender: senderType,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: "delivered",
              type: type,
              fileUrl: fileUrl,
            },
          ])
          // Optionally show notification
          if (selectedContact && senderType === "contact") {
            if (typeof showMessageNotification === "function") {
              showMessageNotification(
                selectedContact!,
                msgData.content || msgData.fileName || ""
              )
            }
          }
        } catch (e) {}
      }
    )
    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [selectedChatId, selectedContact])
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [contactTyping, setContactTyping] = useState<string | null>(null) // contactId who is typing
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const {toast} = useToast()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [documentHidden, setDocumentHidden] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Add this state for the custom notification
  const [showCustomNotification, setShowCustomNotification] = useState(false)
  const [customNotificationData, setCustomNotificationData] = useState<{
    contactName: string
    message: string
  } | null>(null)

  // Contacts state (fetched from backend)
  const [contacts, setContacts] = useState<Contact[]>([])

  // Map to store avatar URLs for contacts by chatId
  const [avatarMap, setAvatarMap] = useState<{[receiverId: string]: string}>({})

  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch(`${backendUrl}/api/v1/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setContacts(
            data.map((user: any) => {
              const fullName =
                user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName || user.lastName || user.email
              // Format lastSeen to a readable string
              let lastSeenFormatted = ""
              if (user.lastSeen) {
                const date = new Date(user.lastSeen)
                lastSeenFormatted = `Last seen ${date.toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              }
              // Set avatar fallback here
              let avatarUrl =
                user.avatar || "/placeholder.svg?height=40&width=40"
              if (avatarUrl.includes("placeholder.svg")) {
                avatarUrl = "/placeholder-user.jpg"
              }
              return {
                id: user.id || user.email,
                name: fullName,
                avatar: avatarUrl,
                lastMessage: "",
                timestamp: lastSeenFormatted,
                isOnline: user.online ?? user.isOnline ?? false,
                unreadCount: 0,
              }
            })
          )
          setContactsCount(data.length)
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchContacts()
  }, [])

  // Mock messages for selected contact
  const mockMessages: Message[] = []

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }
  }, [router])

  // Fetch multiple neko images and map them to receiverId
  const fetchNekoImagesForContacts = async () => {
    const token = localStorage.getItem("token")
    const senderId = localStorage.getItem("userId")
    if (!token || !senderId || contacts.length === 0) return

    // Fetch neko images
    const url = `${backendUrl}/api/proxy/neko-image?contactsCount=${contacts.length}`
    const res = await fetch(url)
    const data = await res.json()
    if (!Array.isArray(data) || data.length !== contacts.length) return

    // Map each image to the receiverId
    const newAvatarMap: {[receiverId: string]: string} = {}
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]
      newAvatarMap[contact.id] = data[i].url
    }
    setAvatarMap(newAvatarMap)
  }

  // Set default selected contact when contacts are loaded
  useEffect(() => {
    if (contacts.length > 0) {
      setSelectedContact(contacts[0])
      // Fetch avatars for all contacts and map to chatId
      fetchNekoImagesForContacts()
      // We'll fetch messages in handleContactSelect
    }
  }, [contacts])

  const fetchMessages = async (chatId: string, token: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/messages/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch messages")
      const data = await res.json()
      return data.map((msg: any) => {
        let isoString = msg.createdAt
        if (typeof isoString === "string") {
          if (isoString.includes(" ") && !isoString.includes("T")) {
            isoString = isoString.replace(" ", "T") + "Z"
          } else if (isoString.includes("T") && !isoString.endsWith("Z")) {
            isoString = isoString + "Z"
          }
          const match = isoString.match(/^(.+\.\d{3})\d*(.*)$/)
          if (match) {
            isoString = match[1] + match[2]
          }
        }
        const dateObj = new Date(isoString)
        const now = new Date()
        const currentDateIST = now.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        })
        const messageDateIST = dateObj.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        })
        const isToday = currentDateIST === messageDateIST
        let timestamp
        if (isToday) {
          timestamp = dateObj.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        } else {
          timestamp = dateObj.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        }
        return {
          id: msg.id.toString(),
          text: msg.content,
          sender:
            msg.senderId === localStorage.getItem("userId")
              ? "user"
              : "contact",
          timestamp: timestamp,
          status: msg.state ? msg.state.toLowerCase() : "sent",
          type: msg.type ? msg.type.toLowerCase() : "text",
          fileUrl:
            (msg.type === "IMAGE" ||
              msg.type === "image" ||
              msg.type === "FILE" ||
              msg.type === "file") &&
            msg.mediaUrl
              ? msg.mediaUrl
              : undefined,
        }
      })
    } catch (err) {
      console.error("Error fetching messages:", err)
      return []
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact || !selectedChatId) return

    const senderId = localStorage.getItem("userId")
    const token = localStorage.getItem("token")
    if (!senderId || !token) {
      toast({
        title: "Missing user info",
        description: "User ID or token not found in localStorage.",
        variant: "destructive",
      })
      return
    }

    const payload = {
      content: message,
      senderId,
      receiverId: selectedContact.id,
      type: "TEXT",
      chatId: selectedChatId,
    }

    // 1. Real-time send via WebSocket
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(payload),
      })
    }

    // 2. Persist message via REST API
    try {
      await fetch(`${backendUrl}/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      // Optionally handle error
    }

    // Optimistically add the message to the UI
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      type: "text",
    }
    setMessages((prev) => [...prev, newMessage])
    setMessage("")
  }

  // Update the showMessageNotification function to include custom notification:

  // Initialize notification sound
  useEffect(() => {
    // Create a simple notification sound using Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(
        0.2,
        audioContext.currentTime + 0.01
      )
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      )

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    audioRef.current = {play: createNotificationSound} as any
  }, [])

  // Handle document visibility for notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      setDocumentHidden(document.hidden)
      if (!document.hidden) {
        setUnreadCount(0)
        setHasNewMessage(false)
        // Update page title back to normal
        document.title = "Netronix - Next Generation Messaging"
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    // ...existing code...
  }, [])

  // Helper to get or create chatId between two users
  const getChatId = async (
    senderId: string,
    receiverId: string,
    token: string
  ) => {
    try {
      console.log("Sender ID:", senderId)
      console.log("Receiver ID:", receiverId)
      if (!senderId || !receiverId) {
        throw new Error("Sender or receiver ID is missing!")
      }
      const res = await fetch(
        `${backendUrl}/api/v1/chats?sender_id=${senderId}&receiver_id=${receiverId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(
          `Failed to create or fetch chat: ${res.status} ${errorText}`
        )
      }
      const data = await res.json()
      if (!data.response) {
        throw new Error("No chatId returned from backend!")
      }
      return data.response // chatId
    } catch (err: any) {
      console.error("getChatId error:", err)
      throw err
    }
  }
  // Update the showMessageNotification function to include custom notification:
  const showMessageNotification = (contact: Contact, messageText: string) => {
    if (!notificationsEnabled) return

    // Play notification sound
    try {
      if (audioRef.current && typeof audioRef.current.play === "function") {
        audioRef.current.play()
      }
    } catch (error) {
      console.log("Could not play notification sound:", error)
    }

    // Visual notification badge
    setHasNewMessage(true)

    // Show custom notification
    setCustomNotificationData({contactName: contact.name, message: messageText})
    setShowCustomNotification(true)

    // Browser notification (if tab is not active)
    if (
      documentHidden &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const notification = new Notification(
        `New message from ${contact.name}`,
        {
          body: messageText,
          icon: "/placeholder.svg?height=64&width=64",
          badge: "/placeholder.svg?height=32&width=32",
          tag: "futurechat-message",
          requireInteraction: false,
        }
      )

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      setTimeout(() => notification.close(), 5000)
    }

    // Update unread count and page title
    if (documentHidden) {
      setUnreadCount((prev) => prev + 1)
      document.title = `(${unreadCount + 1}) New Message - Netronix`
    }

    // Clear the notification badge and custom notification
    setTimeout(() => {
      setHasNewMessage(false)
      setShowCustomNotification(false)
    }, 5000)
  }

  // Helper to fetch random image from backend proxy (avoids CORS)
  const fetchNekoImage = async (contactsCountParam?: number) => {
    try {
      // Pass contactsCount as a query parameter to the endpoint
      const url =
        contactsCountParam !== undefined
          ? `${backendUrl}/api/proxy/neko-image?contactsCount=${contactsCountParam}`
          : `${backendUrl}/api/proxy/neko-image`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data[0].url || ""
      }
      return ""
    } catch {
      return ""
    }
  }

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact)
    setSidebarOpen(false)

    // Only create chatId now
    const senderId = localStorage.getItem("userId")
    const token = localStorage.getItem("token")
    if (!senderId || !token) {
      toast({
        title: "Missing user info",
        description: "User ID or token not found in localStorage.",
        variant: "destructive",
      })
      return
    }

    try {
      const chatId = await getChatId(senderId, contact.id, token)
      // Set nekoImageUrl from avatarMap if available
      if (avatarMap[contact.id]) {
        setNekoImageUrl(avatarMap[contact.id])
      } else {
        setNekoImageUrl("")
      }
      // Only show toast if chatId is different from the previous one
      if (selectedChatId !== chatId) {
        // toast({
        //   title: "Chat ID generated",
        //   description: `Chat ID: ${chatId}`,
        //   duration: 2000,
        // })
      }
      setSelectedChatId(chatId)
      // Fetch chat history from backend
      const history = await fetchMessages(chatId, token)
      setMessages(history)
      // Mark messages as seen
      try {
        await fetch(`${backendUrl}/api/v1/messages?chat-id=${chatId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        // Optionally handle error
      }
    } catch (err: any) {
      toast({
        title: "Chat error",
        description: err.message || "Failed to create or fetch chat.",
        variant: "destructive",
      })
    }
  }

  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch(`${backendUrl}/api/v1/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setContacts(
            data.map((user: any) => {
              const fullName =
                user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName || user.lastName || user.email
              // Format lastSeen to a readable string
              let lastSeenFormatted = ""
              if (user.lastSeen) {
                const date = new Date(user.lastSeen)
                lastSeenFormatted = `Last seen ${date.toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              }
              // Set avatar fallback here
              let avatarUrl =
                user.avatar || "/placeholder.svg?height=40&width=40"
              if (avatarUrl.includes("placeholder.svg")) {
                avatarUrl = "/placeholder-user.jpg"
              }
              return {
                id: user.id || user.email,
                name: fullName,
                avatar: avatarUrl,
                lastMessage: "",
                timestamp: lastSeenFormatted,
                isOnline: user.online ?? user.isOnline ?? false,
                unreadCount: 0,
              }
            })
          )
          setContactsCount(data.length)
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchContacts()
  }, [])

  return (
    <div className="h-screen flex bg-black/20">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || (isClient && window.innerWidth >= 768)) && (
          <ResizablePanel
            defaultWidth={320}
            minWidth={280}
            maxWidth={600}
            className="fixed md:relative z-20 h-full"
            onWidthChange={(width) => {
              // Optional: Save to localStorage for persistence
              localStorage.setItem("sidebarWidth", width.toString())
            }}
          >
            <motion.div
              initial={{x: -300}}
              animate={{x: 0}}
              exit={{x: -300}}
              transition={{type: "spring", damping: 25, stiffness: 200}}
              className="w-full h-full glass-dark border-r border-white/10 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-white">Netronix</h1>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10 md:hidden"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10 professional-input text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto professional-scrollbar">
                {contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileHover={{backgroundColor: "rgba(59, 130, 246, 0.1)"}}
                    whileTap={{scale: 0.98}}
                    onClick={() => handleContactSelect(contact)}
                    className={`contact-item p-4 cursor-pointer border-b border-white/5 ${
                      selectedContact?.id === contact.id ? "active" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={
                            avatarMap[contact.id]
                              ? avatarMap[contact.id]
                              : contact.avatar &&
                                !contact.avatar.includes("placeholder.svg") &&
                                contact.avatar !== ""
                              ? contact.avatar
                              : "/placeholder-user.jpg"
                          }
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-user.jpg"
                          }}
                        />
                        {contact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black pulse-glow"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium truncate">
                            {contact.name}
                          </h3>
                          <span className="text-xs text-white/50">
                            {contactTyping === contact.id
                              ? "Typing..."
                              : contact.isOnline
                              ? "Online"
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white/70 truncate">
                            {contact.lastMessage}
                          </p>
                          {contact.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </ResizablePanel>
        )}
      </AnimatePresence>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="glass-dark border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 md:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div className="relative flex flex-col items-center">
                    {nekoImageUrl && nekoImageUrl !== "" ? (
                      <img
                        src={nekoImageUrl}
                        alt="Neko Random"
                        className="w-10 h-10 rounded-full object-cover mb-1 border-2 border-pink-400"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={
                          selectedContact?.avatar &&
                          !selectedContact?.avatar.includes(
                            "placeholder.svg"
                          ) &&
                          selectedContact?.avatar !== ""
                            ? selectedContact?.avatar
                            : "/placeholder-user.jpg"
                        }
                        alt={selectedContact?.name || "Contact"}
                        className="w-10 h-10 rounded-full object-cover"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-user.jpg"
                        }}
                      />
                    )}
                    {selectedContact?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-white font-medium">
                      {selectedContact?.name || "Contact"}
                    </h2>
                    <p className="text-xs text-white/50">
                      {contactTyping === selectedContact?.id
                        ? "Typing..."
                        : selectedContact?.isOnline
                        ? "Online"
                        : selectedContact?.timestamp || "Last seen recently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white/10 ${
                      hasNewMessage ? "animate-pulse" : ""
                    }`}
                    onClick={() =>
                      setNotificationsEnabled(!notificationsEnabled)
                    }
                    title={
                      notificationsEnabled
                        ? "Disable notifications"
                        : "Enable notifications"
                    }
                  >
                    {notificationsEnabled ? (
                      <Bell
                        className={`w-5 h-5 ${
                          hasNewMessage ? "text-blue-400" : ""
                        }`}
                      />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                    {hasNewMessage && (
                      <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                      />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 professional-scrollbar">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -20}}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "message-bubble-user text-white"
                          : "message-bubble-contact text-white"
                      }`}
                    >
                      {/* WhatsApp-like file/image message rendering */}
                      {msg.fileUrl && msg.type === "image" ? (
                        <div className="flex flex-col items-start">
                          <img
                            src={msg.fileUrl}
                            alt={msg.text || "Image"}
                            className="rounded-lg max-w-[200px] max-h-[200px] mb-1 border border-white/10"
                            style={{objectFit: "cover"}}
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <span className="font-medium text-white/90 mt-1">
                            {msg.text}
                          </span>
                          <a
                            href={msg.fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 underline text-xs mt-1"
                          >
                            Download
                          </a>
                          {!msg.fileUrl && (
                            <span className="text-xs text-red-400 mt-1">
                              Image not available
                            </span>
                          )}
                        </div>
                      ) : msg.fileUrl && msg.type === "file" ? (
                        <div className="flex items-center space-x-2">
                          {/* File type icon based on extension */}
                          {(() => {
                            const ext =
                              msg.fileUrl.split(".").pop()?.toLowerCase() || ""
                            if (["pdf"].includes(ext)) {
                              return (
                                <svg
                                  width="24"
                                  height="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-file w-6 h-6 text-red-400"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              )
                            } else if (["doc", "docx"].includes(ext)) {
                              return (
                                <svg
                                  width="24"
                                  height="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-file w-6 h-6 text-blue-400"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              )
                            } else if (["xls", "xlsx"].includes(ext)) {
                              return (
                                <svg
                                  width="24"
                                  height="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-file w-6 h-6 text-green-400"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              )
                            } else if (["zip", "rar"].includes(ext)) {
                              return (
                                <svg
                                  width="24"
                                  height="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-file w-6 h-6 text-yellow-400"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              )
                            } else {
                              return (
                                <svg
                                  width="24"
                                  height="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-file w-6 h-6 text-blue-400"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              )
                            }
                          })()}
                          <div className="flex flex-col">
                            <span className="font-medium text-white/90">
                              {msg.text}
                            </span>
                            {/* Show file extension */}
                            <span className="text-xs text-white/50 mt-0.5">
                              {msg.fileUrl.split(".").pop()?.toUpperCase() ||
                                "FILE"}
                            </span>
                            <a
                              href={msg.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 underline text-xs mt-1"
                            >
                              Download
                            </a>
                            {/* PDF preview */}
                            {msg.fileUrl.split(".").pop()?.toLowerCase() ===
                              "pdf" && (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-300 underline text-xs mt-1"
                              >
                                Preview
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.text}</p>
                      )}
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-70">
                          {msg.timestamp}
                        </span>
                        {msg.sender === "user" && (
                          <div className="flex">
                            <div
                              className={`w-1 h-1 rounded-full ${
                                msg.status === "sent"
                                  ? "bg-white/50"
                                  : msg.status === "delivered"
                                  ? "bg-white/70"
                                  : "bg-blue-300"
                              }`}
                            ></div>
                            <div
                              className={`w-1 h-1 rounded-full ml-0.5 ${
                                msg.status === "delivered"
                                  ? "bg-white/70"
                                  : msg.status === "seen"
                                  ? "bg-blue-300"
                                  : "bg-white/30"
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  className="flex justify-start"
                >
                  <div className="glass px-4 py-2 rounded-2xl">
                    <div className="flex items-center space-x-1">
                      <span className="text-white/70 text-sm">
                        {selectedContact?.name || "Contact"} is typing
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white/70 rounded-full typing-dot"></div>
                        <div className="w-1 h-1 bg-white/70 rounded-full typing-dot"></div>
                        <div className="w-1 h-1 bg-white/70 rounded-full typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="glass-dark border-t border-white/10 p-4">
              <div className="flex items-center space-x-2">
                {/* File upload button and hidden input */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={handlePaperclipClick}
                  type="button"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{display: "none"}}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,application/octet-stream"
                />

                <Input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    // Emit typing event
                    const senderId = localStorage.getItem("userId")
                    const receiverId = selectedContact?.id
                    if (
                      stompClientRef.current &&
                      stompClientRef.current.connected &&
                      senderId &&
                      receiverId
                    ) {
                      stompClientRef.current.publish({
                        destination: "/app/chat.typing",
                        body: JSON.stringify({
                          event: "typing",
                          senderId,
                          receiverId,
                          chatId: selectedChatId,
                        }),
                      })
                    }
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 professional-input text-white placeholder:text-white/50"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Mic className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  variant="futuristic"
                  size="icon"
                  className="neon-glow"
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/50">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Welcome to Netronix</h2>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Custom Notification Component */}
      <MessageNotification
        isVisible={showCustomNotification && !documentHidden}
        contactName={customNotificationData?.contactName || ""}
        message={customNotificationData?.message || ""}
        onClose={() => setShowCustomNotification(false)}
        onClick={() => {
          setShowCustomNotification(false)
          // Could add logic to scroll to the new message
        }}
      />
    </div>
  )
}
