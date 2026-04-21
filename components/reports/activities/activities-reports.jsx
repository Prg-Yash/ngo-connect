import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  collectionGroup,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import ActivityReportPDF from "./activity-report-pdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const getDateBounds = (timeFrame, dateRange) => {
  const today = new Date();

  if (dateRange?.from && dateRange?.to) {
    return { startDate: new Date(dateRange.from), endDate: new Date(dateRange.to) };
  }

  let startDate = new Date(today);
  if (timeFrame === "3months") {
    startDate.setMonth(today.getMonth() - 3);
  } else if (timeFrame === "1year") {
    startDate.setFullYear(today.getFullYear() - 1);
  } else {
    startDate.setMonth(today.getMonth() - 1);
  }

  return { startDate, endDate: today };
};

export default function ActivitiesReports({
  timeFrame,
  dateRange,
  activitiesData,
}) {
  const { startDate, endDate } = getDateBounds(timeFrame, dateRange);

  const formatDateRange = () => {
    if (!startDate || !endDate) return "All Time";
    return `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`;
  };

  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activityData, setActivityData] = useState({
    total: 0,
    breakdown: [],
    participants: 0,
    categoryDistribution: [],
  });
  const [ngoId, setNgoId] = useState(null);
  const [ngoCategories, setNgoCategories] = useState([]);
  const [ngoInfo, setNgoInfo] = useState({
    name: "",
    address: "",
    email: "",
  });
  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    totalParticipants: 0,
    topActivities: [],
  });
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Prepare report data for PDF export
  const reportData = {
    timeFrame: formatDateRange(),
    dateRange: {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
    },
    ngoInfo: ngoInfo,
    activities: {
      total: activityData.total,
      participants: activityData.participants,
      breakdown: activityData.breakdown,
      timeFrame: timeFrame,
    },
    date: new Date().toLocaleDateString(),
  };

  // Fetch NGO ID, categories, and info once on component mount
  useEffect(() => {
    const fetchNgoInfo = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Get NGO ID from user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) return;

        const userNgoId = userDoc.data().ngoId;
        setNgoId(userNgoId);

        // Get NGO categories and basic info
        const ngoDoc = await getDoc(doc(db, "ngo", userNgoId));
        if (ngoDoc.exists()) {
          const ngoData = ngoDoc.data();
          setNgoCategories(ngoData.categories || []);
          setNgoInfo({
            name: ngoData.ngoName || "Your NGO",
            address: ngoData.address || "NGO Address",
            email: ngoData.email || user.email || "NGO Email",
          });
        }
      } catch (error) {
        console.error("Error fetching NGO info:", error);
      }
    };

    fetchNgoInfo();
  }, []);

  // Process activities data using date objects for comparison
  const processActivitiesData = (
    activitiesSnapshot,
    startDateTimestamp,
    endDateTimestamp,
  ) => {
    let totalActivities = 0;
    let totalParticipants = 0;
    const categoryCount = {};

    // Initialize category counts
    ngoCategories.forEach((category) => {
      categoryCount[category] = 0;
    });

    const filteredActivities = [];
    
    // Add 12 hours buffer to start/end timestamp to prevent timezone truncations skipping events
    const startBound = startDateTimestamp - 43200000;
    const endBound = endDateTimestamp + 86400000;

    activitiesSnapshot.forEach((activityDoc) => {
      try {
        const activity = activityDoc.data();

        // Extract eventDate directly
        const eventDate = activity.eventDate || activity.date;
        if (!eventDate) return; 

        let activityTimestamp;
        if (eventDate.toDate) {
          activityTimestamp = eventDate.toDate().getTime();
        } else {
          activityTimestamp = new Date(eventDate).getTime();
        }

        // Filter by date range
        if (
          activityTimestamp >= startBound &&
          activityTimestamp <= endBound
        ) {
          totalActivities++;
          
          let parts = 0;
          if (Array.isArray(activity.participants)) parts = activity.participants.length;
          else if (activity.registeredCount) parts = parseInt(activity.registeredCount);
          else if (activity.noOfParticipants) parts = parseInt(activity.noOfParticipants);
          
          totalParticipants += parts;

          // Count by category
          const category = activity.category || "Uncategorized";
          if (!categoryCount.hasOwnProperty(category)) {
            categoryCount[category] = 0;
          }
          categoryCount[category]++;

          filteredActivities.push({...activity, computedParts: parts});
        }
      } catch (err) {
        console.log("Error processing activity:", activityDoc.id, err);
      }
    });

    // Prepare category breakdown for display
    const categoryBreakdown = Object.keys(categoryCount).map((category) => ({
      category,
      count: categoryCount[category],
      participants: 0,
    }));

    // Calculate participants per category
    filteredActivities.forEach((activity) => {
      try {
        const category = activity.category || "Uncategorized";
        const categoryIndex = categoryBreakdown.findIndex(
          (item) => item.category === category,
        );
        if (categoryIndex !== -1) {
          categoryBreakdown[categoryIndex].participants += activity.computedParts;
        }
      } catch (err) {
        console.log("Error processing category data:", err);
      }
    });

    // Sort categories by count for chart display
    const topCategories = [...categoryBreakdown]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      total: totalActivities,
      breakdown: categoryBreakdown,
      participants: totalParticipants,
      categoryDistribution: topCategories,
    };
  };

  // Set up realtime listener for activities when ngoId, startDate, and endDate change
  useEffect(() => {
    if (!ngoId || ngoCategories.length === 0 || !startDate || !endDate) return;

    setLoading(true);

    // Get timestamps for date comparison
    const startDateTimestamp = startDate.getTime();
    const endDateTimestamp = endDate.getTime();

    // Query activities by NGO ID
    const activitiesQuery = query(
      collection(db, "activities"),
      where("ngoId", "==", ngoId),
    );

    // Set up realtime listener
    const unsubscribe = onSnapshot(
      activitiesQuery,
      (activitiesSnapshot) => {
        try {
          const processedData = processActivitiesData(
            activitiesSnapshot,
            startDateTimestamp,
            endDateTimestamp,
          );
          setActivityData(processedData);
        } catch (error) {
          console.error("Error processing activities data:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Realtime activities listener error:", error);
        setLoading(false);
      },
    );

    // Clean up listener on unmount or when dependencies change
    return () => unsubscribe();
  }, [ngoId, ngoCategories, timeFrame]);

  useEffect(() => {
    // Use activitiesData from props if available
    if (activitiesData && activitiesData.length > 0) {
      setActivities(activitiesData);

      // Calculate statistics
      const now = new Date();
      const upcoming = activitiesData.filter((activity) => {
        const activityDate = activity.date
          ? activity.date.toDate
            ? activity.date.toDate()
            : new Date(activity.date)
          : new Date();
        return activityDate > now;
      }).length;

      const completed = activitiesData.filter((activity) => {
        const activityDate = activity.date
          ? activity.date.toDate
            ? activity.date.toDate()
            : new Date(activity.date)
          : new Date();
        return activityDate <= now;
      }).length;

      const totalParticipants = activitiesData.reduce(
        (sum, activity) =>
          sum + (activity.registeredCount || activity.participants || 0),
        0,
      );

      // Top activities by participation
      const topActivities = [...activitiesData]
        .sort(
          (a, b) =>
            (b.registeredCount || b.participants || 0) -
            (a.registeredCount || a.participants || 0),
        )
        .slice(0, 3)
        .map((activity) => ({
          name: activity.name,
          date: activity.date,
          participants: activity.registeredCount || activity.participants || 0,
        }));

      const stats = {
        total: activitiesData.length,
        upcoming,
        completed,
        totalParticipants,
        topActivities,
      };

      setActivityStats(stats);
      return;
    }

    const fetchActivities = async () => {
      try {
        const ngoId = auth.currentUser?.uid;
        if (!ngoId) {
          console.log("No NGO ID found");
          return;
        }

        console.log("Fetching activities for NGO:", ngoId);

        // Fetch user document to get activities array
        const userDoc = await getDoc(doc(db, "users", ngoId));
        if (!userDoc.exists()) {
          console.log("User document not found");
          return;
        }

        const activitiesIds = userDoc.data().activities || [];
        console.log("Activity IDs:", activitiesIds);

        // Fetch each activity
        const activitiesPromises = activitiesIds.map(async (activityId) => {
          const activityDoc = await getDoc(doc(db, "activities", activityId));
          if (activityDoc.exists()) {
            return {
              id: activityId,
              ...activityDoc.data(),
            };
          }
          return null;
        });

        const activitiesResults = await Promise.all(activitiesPromises);
        const validActivities = activitiesResults.filter(
          (activity) => activity !== null,
        );
        console.log("Valid Activities:", validActivities);

        setActivities(validActivities);

        // Calculate statistics
        const now = new Date();
        const upcoming = validActivities.filter((activity) => {
          const activityDate = activity.date
            ? activity.date.toDate
              ? activity.date.toDate()
              : new Date(activity.date)
            : new Date();
          return activityDate > now;
        }).length;

        const completed = validActivities.filter((activity) => {
          const activityDate = activity.date
            ? activity.date.toDate
              ? activity.date.toDate()
              : new Date(activity.date)
            : new Date();
          return activityDate <= now;
        }).length;

        const totalParticipants = validActivities.reduce(
          (sum, activity) =>
            sum + (activity.registeredCount || activity.participants || 0),
          0,
        );

        // Top activities by participation
        const topActivities = [...validActivities]
          .sort(
            (a, b) =>
              (b.registeredCount || b.participants || 0) -
              (a.registeredCount || a.participants || 0),
          )
          .slice(0, 3)
          .map((activity) => ({
            name: activity.name,
            date: activity.date,
            participants:
              activity.registeredCount || activity.participants || 0,
          }));

        const stats = {
          total: validActivities.length,
          upcoming,
          completed,
          totalParticipants,
          topActivities,
        };

        setActivityStats(stats);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, [activitiesData]);

  // Handle PDF export
  const handleExportPDF = () => {
    setIsExporting(true);
    // We'll use the PDFDownloadLink's automatic download functionality
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>Activities Overview</div>
              <Skeleton className="h-10 w-[120px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle empty data
  if (activityData.total === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>Activities Overview</div>
              <Button disabled={true}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 mr-2 text-gray-500" />
                <span className="text-gray-500 font-medium">
                  {formatDateRange()}
                </span>
              </div>
              <p className="text-xl">
                No activities found for the selected time period.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <span>Activities Overview</span>
              <div className="ml-4 px-3 py-1 bg-gray-100 rounded-md text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-500">{formatDateRange()}</span>
              </div>
            </div>
            <PDFDownloadLink
              document={<ActivityReportPDF reportData={reportData} />}
              fileName={`Activities_Report_${formatDateRange().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`}
            >
              {({ blob, url, loading, error }) => (
                <Button
                  onClick={handleExportPDF}
                  disabled={loading || isExporting}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {loading || isExporting ? "Generating..." : "Export PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-4">
            Total Activities: {activityData.total}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Activity Breakdown</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Participants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.breakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.participants}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Top 3 Categories</h3>
              <div className="h-[300px]">
                {activityData.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData.categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Activities" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No categories to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Participants</h3>
              <p className="text-2xl font-bold">
                {activityData.participants} Participants
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
