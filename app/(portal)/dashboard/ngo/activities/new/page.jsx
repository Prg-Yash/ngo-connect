"use client";
import { auth, storage, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const page = () => {
  const [eventName, setEventName] = useState("");
  const [tagline, setTagline] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [eventDate, setEventDate] = useState("");
  const [participationDeadline, setParticipationDeadline] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [location, setLocation] = useState("");
  const [NgoId, setNgoId] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [ngoName, setNgoName] = useState("");
  const router = useRouter();
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  // New states for category
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState("");

  // Fetch members and categories when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) return;

        // First get the NGO ID from the current user's document
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists()) {
          console.error("User document not found");
          return;
        }

        const ngoId = userDoc.data().ngoId;
        setNgoName(userDoc.data().ngoName);
        setNgoId(ngoId);

        // Set current user as default coordinator
        setCoordinator(auth.currentUser.uid);
        const currentUserEmail = auth.currentUser.email;
        setCoordinatorEmail(currentUserEmail);

        // Fetch categories from ngo collection
        const ngoDoc = await getDoc(doc(db, "ngo", ngoId));
        if (ngoDoc.exists() && ngoDoc.data().categories) {
          setCategories(ngoDoc.data().categories);
        }

        // Fetch all members from the NGO's members subcollection
        const membersRef = collection(db, "ngo", ngoId, "members");
        const membersSnapshot = await getDocs(membersRef);

        const membersList = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMembers(membersList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);
    setShowOtherCategory(selected === "other");
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (
        !eventName ||
        !tagline ||
        !shortDescription ||
        !featuredImage ||
        !logo ||
        !eventDate ||
        !participationDeadline ||
        !coordinator ||
        !contactEmail ||
        !location ||
        !selectedCategory
      ) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Handle category selection
      let finalCategory = selectedCategory;

      // If "other" is selected, use the custom category
      if (selectedCategory === "other") {
        if (!otherCategory.trim()) {
          toast.error("Please enter a category name");
          setIsLoading(false);
          return;
        }
        finalCategory = otherCategory.trim();

        // Add the new category to the NGO's categories array if it doesn't exist
        if (!categories.includes(finalCategory)) {
          const ngoRef = doc(db, "ngo", NgoId);
          await updateDoc(ngoRef, {
            categories: arrayUnion(finalCategory),
          });
        }
      }

      // Generate event ID
      const timestamp = new Date(eventDate).getTime();
      const eventId = `${eventName.replace(/ /g, "-").toLowerCase()}_${timestamp}`;

      // Upload images
      const featuredImagePath = `events/${NgoId}/${eventId}/featured_image`;
      const logoPath = `events/${NgoId}/${eventId}/logo`;

      const [featuredImageUrl, logoUrl] = await Promise.all([
        uploadImage(featuredImage, featuredImagePath),
        uploadImage(logo, logoPath),
      ]);

      // Create event data
      const eventData = {
        eventId,
        ngoId: NgoId,
        eventName,
        tagline,
        shortDescription,
        featuredImageUrl,
        logoUrl,
        eventDate,
        participationDeadline,
        coordinatorId: coordinator,
        contactEmail,
        location,
        additionalNotes,
        category: finalCategory,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid,
      };

      // Add event to activities collection
      await setDoc(doc(db, "activities", eventId), eventData);

      // Update NGO's activities array
      const ngoRef = doc(db, "users", NgoId);
      await updateDoc(ngoRef, {
        activities: arrayUnion(eventId),
      });

      // Add coordinatedEvents subcollection in users -> coordinatorId
      const coordinatorRef = doc(db, "users", coordinator);
      const coordinatedEventRef = doc(
        db,
        "users",
        coordinator,
        "coordinatedEvents",
        eventId
      );

      const coordinatedEventData = {
        attendedParticipants: [],
        attendedVolunteers: [],
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(coordinatedEventRef, coordinatedEventData);

      // Update coordinator's coordinatedEvents array
      await updateDoc(coordinatorRef, {
        coordinatedEvents: arrayUnion(eventId),
      });

      const activityURL = `/dashboard/ngo/activities/${eventId}`;
      await fetch("/api/coordinator-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          tagline,
          shortDescription,
          featureImageUrl: featuredImageUrl,
          eventDate,
          ngoName,
          activityURL,
          email: coordinatorEmail,
        }),
      });

      toast.success("Event created successfully!");
      // toast.loading("Redirecting to event form page...");
      router.push(`/dashboard/ngo/activities/${eventId}/forms`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event: " + error.message);
    } finally {
      setIsLoading(false);
      setEventName("");
      setTagline("");
      setShortDescription("");
      setFeaturedImage(null);
      setLogo(null);
      setEventDate("");
      setParticipationDeadline("");
      setCoordinator("");
      setContactEmail("");
      setLocation("");
      setAdditionalNotes("");
      setSelectedCategory("");
      setOtherCategory("");
    }
  };

  const handleCoordinator = (e) => {
    const coordinator = e.target.value;
    setCoordinator(coordinator);

    fetchCoordinatorData(coordinator);
  };

  const fetchCoordinatorData = async (coordinator) => {
    try {
      const coordinatorDoc = await getDoc(doc(db, "users", coordinator));
      if (coordinatorDoc.exists()) {
        setCoordinatorEmail(coordinatorDoc.data().email);
      }
    } catch (error) {
      console.error("Error fetching coordinator data:", error);
    }
  };

  return (
    <div className="mx-auto p-8 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-[24px]">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 text-center">Create Event</h1>

      <form className="space-y-4">
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Event Name</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Tagline</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setTagline(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Short Description</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />
        </div>
        {/* New Category field */}
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Event Category</label>
          <select
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={handleCategoryChange}
            value={selectedCategory}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>
        {/* Conditional text field for custom category */}
        {showOtherCategory && (
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Specify Category</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              placeholder="Enter new category"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Featured Image</label>
          <input
            type="file"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setFeaturedImage(e.target.files[0])}
            required
            accept="image/*"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Upload Logo</label>
          <input
            type="file"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setLogo(e.target.files[0])}
            required
            accept="image/*"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Event Date</label>
          <input
            type="date"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Participation Deadline</label>
          <input
            type="date"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setParticipationDeadline(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Coordinator</label>
          <select
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => handleCoordinator(e)}
            value={coordinator}
            required
          >
            <option value={auth.currentUser?.uid}>Me (Default)</option>
            {members
              .filter((member) => member.status === "active")
              .map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.email}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Contact Email</label>
          <input
            type="email"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Location</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-12 px-4 transition-colors"
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5 ml-1">Additional Notes</label>
          <textarea
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1FC276] bg-white shadow-sm h-32 transition-colors"
            onChange={(e) => setAdditionalNotes(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-[#1FC276] text-white font-medium p-3 h-12 rounded-full shadow hover:bg-[#1fbe74] transition-all mt-4"
          onClick={handleCreateEvent}
          disabled={isLoading}
        >
          {isLoading ? "Creating Event..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default page;
