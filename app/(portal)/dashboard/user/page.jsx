"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CalendarDays,
  Globe,
  HandHeart,
  IndianRupee,
  Search,
  Target,
  TrendingUp,
  UserCircle2,
  Wallet,
} from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"
import { TranslationModal } from "@/components/TranslationModal"

const formatCurrency = (value) => {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`
}

const formatDate = (value) => {
  if (!value) return "N/A"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const normalizeDate = (value) => {
  if (!value) return null

  if (value?.toDate) {
    return value.toDate()
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === "number") {
    const numericDate = new Date(value)
    return Number.isNaN(numericDate.getTime()) ? null : numericDate
  }

  if (typeof value === "string") {
    const numeric = Number(value)
    if (!Number.isNaN(numeric) && value.trim() !== "") {
      const numericDate = new Date(numeric)
      if (!Number.isNaN(numericDate.getTime())) return numericDate
    }

    const parsedDate = new Date(value)
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  return null
}

const extractLocationText = (location) => {
  if (!location) return "Location TBD"
  if (typeof location === "string") return location
  if (typeof location === "object") {
    if (location.address) return location.address
    if (location.latitude && location.longitude) {
      return `${location.latitude}, ${location.longitude}`
    }
  }
  return "Location TBD"
}

const getRecentMonthBuckets = (count) => {
  const now = new Date()
  const buckets = []

  for (let i = 0; i < count; i += 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      year: cursor.getFullYear().toString(),
      month: cursor.getMonth().toString(),
    })
  }

  return buckets
}

const UserDashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
  const [userName, setUserName] = useState("Volunteer")
  const [stats, setStats] = useState({
    totalDonated: 0,
    ngosSupported: 0,
    participatedEvents: 0,
    upcomingEvents: 0,
  })
  const [recentEvents, setRecentEvents] = useState([])
  const [recentDonations, setRecentDonations] = useState([])

  const { translations } = useLanguage()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setDashboardError("")

        const ngoNameCache = {}
        const getNgoName = async (ngoId) => {
          if (!ngoId) return "Unknown NGO"
          if (ngoNameCache[ngoId]) return ngoNameCache[ngoId]

          const ngoSnap = await getDoc(doc(db, "ngo", ngoId))
          const ngoName = ngoSnap.exists() ? ngoSnap.data().ngoName || "Unknown NGO" : "Unknown NGO"
          ngoNameCache[ngoId] = ngoName
          return ngoName
        }

        const userSnap = await getDoc(doc(db, "users", user.uid))
        const userData = userSnap.exists() ? userSnap.data() : {}

        setUserName(userData?.name || userData?.displayName || "Volunteer")

        const participations = Array.isArray(userData?.participations) ? userData.participations : []
        const today = new Date()

        const enrichedParticipations = (
          await Promise.all(
            participations.map(async (participation) => {
              const activityId = participation?.activityId
              const ngoId = participation?.ngoId

              if (!activityId || !ngoId) return null

              const [activitySnap, ngoName] = await Promise.all([
                getDoc(doc(db, "activities", activityId)),
                getNgoName(ngoId),
              ])

              if (!activitySnap.exists()) return null

              const activityDetails = activitySnap.data()
              const eventDate = normalizeDate(activityDetails?.eventDate)
              const timestampFromId = Number(activityId?.split("_")?.[1])
              const fallbackDate = Number.isNaN(timestampFromId) ? null : new Date(timestampFromId)
              const effectiveDate = eventDate || fallbackDate

              let status = "Missed"
              if (participation?.attendance) {
                status = "Attended"
              } else if (effectiveDate && effectiveDate >= today) {
                status = "Upcoming"
              }

              return {
                id: activityId,
                eventName: activityDetails?.eventName || "Untitled Event",
                ngoName,
                date: effectiveDate,
                location: extractLocationText(activityDetails?.location),
                status,
                sortTime: effectiveDate ? effectiveDate.getTime() : 0,
              }
            })
          )
        ).filter(Boolean)

        enrichedParticipations.sort((a, b) => b.sortTime - a.sortTime)
        setRecentEvents(enrichedParticipations.slice(0, 5))

        const donatedToSnap = await getDocs(collection(db, "users", user.uid, "donatedTo"))
        const ngoIds = donatedToSnap.docs.map((entry) => entry.id)

        const recentDonationRows = []
        const monthBuckets = getRecentMonthBuckets(6)

        for (const ngoId of ngoIds) {
          const ngoName = await getNgoName(ngoId)

          for (const bucket of monthBuckets) {
            const monthPath = `users/${user.uid}/${bucket.year}/${bucket.month}/${ngoId}`
            const monthSnapshot = await getDocs(collection(db, monthPath))

            monthSnapshot.forEach((donationDoc) => {
              const donation = donationDoc.data()
              const resolvedDate =
                normalizeDate(donation?.timestamp) ||
                normalizeDate(donation?.date) ||
                normalizeDate(donation?.donatedOn) ||
                normalizeDate(donationDoc.id)

              recentDonationRows.push({
                id: donationDoc.id,
                ngoName,
                amount: Number(donation?.amount || 0),
                method: donation?.type || donation?.transactionType || donation?.paymentMethod || "Donation",
                date: resolvedDate,
                sortTime: resolvedDate ? resolvedDate.getTime() : 0,
              })
            })
          }
        }

        recentDonationRows.sort((a, b) => b.sortTime - a.sortTime)
        setRecentDonations(recentDonationRows.slice(0, 6))

        const totalDonated = Number(userData?.totalDonated || 0)
        const fallbackTotal = recentDonationRows.reduce((sum, row) => sum + row.amount, 0)

        setStats({
          totalDonated: totalDonated || fallbackTotal,
          ngosSupported: ngoIds.length,
          participatedEvents: participations.length,
          upcomingEvents: enrichedParticipations.filter((event) => event.status === "Upcoming").length,
        })
      } catch (error) {
        console.error("Error loading user dashboard:", error)
        setDashboardError("Unable to load dashboard data right now.")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const quickActions = [
    {
      label: "Discover Activities",
      href: "/dashboard/user/activities/search-activity",
      icon: Search,
      description: "Find nearby volunteering opportunities",
    },
    {
      label: "Explore Campaigns",
      href: "/dashboard/user/campaigns/search-campaign",
      icon: Target,
      description: "Support active social campaigns",
    },
    {
      label: "View Donations",
      href: "/dashboard/user/donations",
      icon: Wallet,
      description: "Track your donations and receipts",
    },
    {
      label: "My Profile",
      href: "/dashboard/user/profile",
      icon: UserCircle2,
      description: "Update your contact and preferences",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <div className="h-64 rounded-xl bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/85 text-sm">{translations.welcome_back || "Welcome back"}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{userName}</h1>
            <p className="text-white/90 text-sm mt-2">
              {translations.dashboard_summary || "Here is your impact snapshot and latest activity."}
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-white/10 border-white/40 text-white hover:bg-white/20"
            onClick={() => setShowTranslationModal(true)}
          >
            <Globe className="h-4 w-4 mr-2" />
            {translations.translate || "Translate"}
          </Button>
        </CardContent>
      </Card>

      {dashboardError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 text-sm">{dashboardError}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Donated</p>
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalDonated)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">NGOs Supported</p>
              <HandHeart className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.ngosSupported}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Participated Events</p>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.participatedEvents}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Upcoming Events</p>
              <CalendarDays className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.upcomingEvents}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Recent Participated Events</CardTitle>
            <CardDescription>Your latest joined activities and their status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No participation history found yet.</p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{event.eventName}</p>
                    <p className="text-sm text-gray-500">{event.ngoName}</p>
                    <p className="text-xs text-gray-400 mt-1">{event.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        event.status === "Attended"
                          ? "bg-green-100 text-green-700"
                          : event.status === "Upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {event.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2">
              <Link href="/dashboard/user/activities">
                <Button variant="outline" size="sm">View all activities</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to your most-used sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-white border border-gray-100">
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest contribution entries from your donation activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDonations.length === 0 ? (
            <div className="text-sm text-gray-500">
              No donation records found in recent months.
              <div className="mt-3">
                <Link href="/dashboard/user/donations">
                  <Button size="sm" variant="outline">Open donations page</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((donation) => (
                <div
                  key={`${donation.ngoName}-${donation.id}`}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{donation.ngoName}</p>
                    <p className="text-sm text-gray-500">{donation.method}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-emerald-700">{formatCurrency(donation.amount)}</span>
                    <span className="text-sm text-gray-500">{formatDate(donation.date)}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard/user/donations">
                  <Button variant="outline" size="sm">
                    View full donation history
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TranslationModal isOpen={showTranslationModal} onClose={() => setShowTranslationModal(false)} />
    </motion.div>
  )
}

export default UserDashboardPage