import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // Import Firestore
import { doc, updateDoc, onSnapshot } from "firebase/firestore"; // Import updateDoc and onSnapshot functions
import toast from "react-hot-toast";

const RequiredLabel = ({ children }) => (
  <Label className="flex items-center gap-1">
    <span className="text-red-500">*</span>
    {children}
  </Label>
);

const DonationInformation = ({ ngoId, approvalStatus, verificationStatus }) => {
  const [donationsData, setDonationsData] = useState({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    isBankTransferEnabled: false,
    isCryptoTransferEnabled: false,
    cryptoWalletAddress: "",
    bankTransferDetails: {
      accountHolderName: "",
      bankName: "",
      branchNameAddress: "",
      accountNumber: "",
      accountType: "",
      ifscCode: "",
    },
    acknowledgmentMessage: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "ngo", ngoId), (doc) => {
      if (doc.exists() && doc.data()?.donationsData) {
        setDonationsData(doc.data().donationsData);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [ngoId]);

  const sanitizeForFirestore = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => sanitizeForFirestore(item))
        .filter((item) => item !== undefined);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, nestedValue]) => nestedValue !== undefined)
          .map(([key, nestedValue]) => [key, sanitizeForFirestore(nestedValue)])
      );
    }

    return value;
  };

  const handleSave = async () => {
    if (!donationsData.razorpayKeyId || !donationsData.razorpayKeySecret) {
      toast.error("Razorpay Key ID and Secret are required.");
      return;
    }

    if (
      donationsData.isBankTransferEnabled &&
      (!donationsData.bankTransferDetails ||
        !donationsData.bankTransferDetails.accountHolderName ||
        !donationsData.bankTransferDetails.bankName ||
        !donationsData.bankTransferDetails.branchNameAddress ||
        !donationsData.bankTransferDetails.accountNumber ||
        !donationsData.bankTransferDetails.accountType ||
        !donationsData.bankTransferDetails.ifscCode)
    ) {
      toast.error("All bank transfer details are required.");
      return;
    }

    console.log("DONATIONDATA", donationsData);

    try {
      const updatedDonationsData = sanitizeForFirestore({
        ...donationsData,
      });

      await updateDoc(doc(db, "ngo", ngoId), {
        donationsData: updatedDonationsData,
      });

      toast.success("Donation settings updated successfully!");
    } catch (error) {
      console.error("Error updating donation settings: ", error);
      toast.error("Failed to update donation settings.");
    }
  };

  const handleChange = (e, key) => {
    setDonationsData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleBankTransferChange = (e, key) => {
    // Initialize bankTransferDetails if it doesn't exist
    const currentBankDetails = donationsData.bankTransferDetails || {
      accountHolderName: "",
      bankName: "",
      branchNameAddress: "",
      accountNumber: "",
      accountType: "",
      ifscCode: "",
    };

    setDonationsData((prev) => ({
      ...prev,
      bankTransferDetails: {
        ...currentBankDetails,
        [key]: e.target.value,
      },
    }));
  };

  const toggleBankTransfer = () => {
    // Initialize bank details if enabling for the first time
    if (
      !donationsData.isBankTransferEnabled &&
      !donationsData.bankTransferDetails
    ) {
      setDonationsData((prev) => ({
        ...prev,
        isBankTransferEnabled: true,
        bankTransferDetails: {
          accountHolderName: "",
          bankName: "",
          branchNameAddress: "",
          accountNumber: "",
          accountType: "",
          ifscCode: "",
        },
      }));
    } else {
      setDonationsData((prev) => ({
        ...prev,
        isBankTransferEnabled: !prev.isBankTransferEnabled,
      }));
    }
  };

  // NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_9xch4WbEcXUxCT
  // RAZORPAY_KEY_SECRET=LpFjSLwn631qJf7fZwNvNuKB

  const shouldDisableInputs =
    (verificationStatus === "verified" && approvalStatus === "verified") ||
    (verificationStatus === "pending" && approvalStatus === "pending");

  const pendingTitle =
    "You cannot update the profile while the verification is in progress";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation & Payout Settings</CardTitle>
        <div className="text-sm text-gray-500 mt-2">
          <span className="text-red-500">*</span> Required fields
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <RequiredLabel>Razorpay Credentials</RequiredLabel>
          <Input
            placeholder="Razorpay Key ID"
            value={donationsData.razorpayKeyId}
            onChange={(e) => handleChange(e, "razorpayKeyId")}
            className="border-gray-300"
            required
            disabled={shouldDisableInputs}
            title={shouldDisableInputs ? pendingTitle : "Your Razorpay Key ID"}
          />
          <Input
            placeholder="Razorpay Key Secret"
            value={donationsData.razorpayKeySecret}
            onChange={(e) => handleChange(e, "razorpayKeySecret")}
            className="border-gray-300"
            required
            disabled={shouldDisableInputs}
            title={
              shouldDisableInputs ? pendingTitle : "Your Razorpay Key Secret"
            }
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <Label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={donationsData.isBankTransferEnabled}
                onChange={toggleBankTransfer}
                className="mr-2"
                disabled={shouldDisableInputs}
                title={
                  shouldDisableInputs
                    ? pendingTitle
                    : "Enable bank transfer option for donors"
                }
              />
              Enable Bank Transfers
            </Label>
          </div>
          {donationsData.isBankTransferEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4">
              <div className="space-y-1">
                <RequiredLabel>Account Holder Name</RequiredLabel>
                <Input
                  placeholder="Account Holder Name"
                  value={
                    donationsData.bankTransferDetails?.accountHolderName || ""
                  }
                  onChange={(e) =>
                    handleBankTransferChange(e, "accountHolderName")
                  }
                  className="border-gray-300"
                  required
                  disabled={shouldDisableInputs}
                  title={
                    shouldDisableInputs
                      ? pendingTitle
                      : "Name as it appears on your bank account"
                  }
                />
              </div>

              <div className="space-y-1">
                <RequiredLabel>Bank Name</RequiredLabel>
                <Input
                  placeholder="Bank Name"
                  value={donationsData.bankTransferDetails?.bankName || ""}
                  onChange={(e) => handleBankTransferChange(e, "bankName")}
                  className="border-gray-300"
                  required
                  disabled={shouldDisableInputs}
                  title={
                    shouldDisableInputs ? pendingTitle : "Name of your bank"
                  }
                />
              </div>

              <div className="space-y-1">
                <RequiredLabel>Branch Name & Address</RequiredLabel>
                <Input
                  placeholder="Branch Name & Address"
                  value={
                    donationsData.bankTransferDetails?.branchNameAddress || ""
                  }
                  onChange={(e) =>
                    handleBankTransferChange(e, "branchNameAddress")
                  }
                  className="border-gray-300"
                  required
                  disabled={shouldDisableInputs}
                  title={
                    shouldDisableInputs
                      ? pendingTitle
                      : "Branch name and address of your bank"
                  }
                />
              </div>

              <div className="space-y-1">
                <RequiredLabel>Account Number</RequiredLabel>
                <Input
                  placeholder="Account Number"
                  value={donationsData.bankTransferDetails?.accountNumber || ""}
                  onChange={(e) => handleBankTransferChange(e, "accountNumber")}
                  className="border-gray-300"
                  required
                  disabled={shouldDisableInputs}
                  title={
                    shouldDisableInputs
                      ? pendingTitle
                      : "Your bank account number"
                  }
                />
              </div>

              <div className="space-y-1">
                <RequiredLabel>Account Type</RequiredLabel>
                <Input
                  placeholder="Account Type (Savings/Current)"
                  value={donationsData.bankTransferDetails?.accountType || ""}
                  onChange={(e) => handleBankTransferChange(e, "accountType")}
                  className="border-gray-300"
                  required
                  disabled={shouldDisableInputs}
                  title={
                    shouldDisableInputs
                      ? pendingTitle
                      : "Type of account (Savings/Current)"
                  }
                />
              </div>

              <div className="space-y-1">
                <RequiredLabel>IFSC Code</RequiredLabel>
                <Input
                  placeholder="IFSC Code"
                  value={donationsData.bankTransferDetails?.ifscCode || ""}
                  onChange={(e) => handleBankTransferChange(e, "ifscCode")}
                  className="border-gray-300"
                  required
                  disabled={shouldDisableInputs}
                  title={
                    shouldDisableInputs
                      ? pendingTitle
                      : "IFSC code of your bank branch"
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Donation Acknowledgment Message</Label>
          <Textarea
            placeholder="Enter your custom thank you message for donors"
            value={donationsData.acknowledgmentMessage}
            onChange={(e) => handleChange(e, "acknowledgmentMessage")}
            className="border-gray-300"
            disabled={shouldDisableInputs}
            title={
              shouldDisableInputs
                ? pendingTitle
                : "Message that will be shown to donors after a successful donation"
            }
          />
        </div>
        <Button
          className="w-full md:w-auto bg-[#1CAC78] hover:bg-[#158f63]"
          onClick={handleSave}
          disabled={shouldDisableInputs}
          title={shouldDisableInputs ? pendingTitle : ""}
        >
          Save Donation Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default DonationInformation;
