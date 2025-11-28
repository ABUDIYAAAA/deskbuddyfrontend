import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ToastProvider";

const ConfirmButton = ({ studentId, stage, onReset, studentData }) => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const volunteerName = user?.displayName || "Anonymous";
  const { addToast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Determine if this is a pass holder based on studentData structure
      const isPassHolder =
        studentData && (studentData.passId || studentData.passType);

      // Determine the correct endpoint based on stage
      const endpoint = stage === "arrival" ? "arrival" : stage;
      const res = await makeAuthenticatedRequest(
        `${API_BASE_URL}/scan/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            volunteerName,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to confirm ${stage}`);
      }

      await res.json();

      // If this is arrival stage, also mark arrival in Damru platform backend
      if (stage === "arrival") {
        try {
          const damruBackendUrl = "https://backend.damrufest.org";

          let requestBody;
          if (isPassHolder) {
            // For pass holders, use email and name (no userId)
            requestBody = {
              email: studentData?.email || `passHolder${studentId}@unknown.com`,
              name: studentData?.name || `Pass Holder ${studentId}`,
            };
          } else {
            // For students, try to use studentId as userId, fallback to email/name
            requestBody = {
              studentId: studentId,
              name: studentData?.name || `Student ${studentId}`,
              email: studentData?.email || `student${studentId}@unknown.com`,
            };
          }

          const arrivalRes = await fetch(`${damruBackendUrl}/arrival/mark`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                localStorage.getItem("deskbuddy_token") || ""
              }`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!arrivalRes.ok) {
            console.warn(
              "Failed to mark arrival in Damru backend:",
              await arrivalRes.text()
            );
            // Don't throw error here - DeskBuddy confirmation was successful
          } else {
            console.log("Successfully marked arrival in Damru backend");
          }
        } catch (damruError) {
          console.warn("Error calling Damru backend:", damruError);
          // Don't throw error - DeskBuddy confirmation was successful
        }
      }

      addToast({
        type: "success",
        title: `${
          stage.charAt(0).toUpperCase() + stage.slice(1)
        } confirmed for ${studentId}`,
        duration: 3500,
      });

      // Reset the scanner after confirmation
      onReset();
    } catch (error) {
      // addToast({
      //   type: 'error',
      //   title: `Failed to confirm: ${error.message}`,
      //   duration: 4000
      // });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorCountSet = (count) => {
    setVisitorCount(count);
    setShowVisitorModal(false);
  };

  const handleGenerateLanyards = () => {
    setShowLanyardPreview(true);
  };

  const handlePrintLanyards = async (pageSize = "a6") => {
    if (visitorCount === 0) {
      addToast({
        type: "warning",
        title: "No visitors to print lanyards for",
        duration: 3000,
      });
      return;
    }

    try {
      // Try direct print first, fallback to PDF if print fails
      try {
        await LanyardPrintService.printDirect(
          visitorCount,
          studentData?.name || studentId,
          async () => {
            // Fallback: If print fails, try PDF
            try {
              await LanyardPrintService.printLanyards(
                visitorCount,
                studentData?.name || studentId,
                pageSize
              );
              addToast({
                type: "success",
                title: `PDF fallback generated with ${visitorCount} lanyard${
                  visitorCount !== 1 ? "s" : ""
                } (${pageSize.toUpperCase()})`,
                duration: 4000,
              });
            } catch (finalError) {
              addToast({
                type: "error",
                title: `Failed to print or generate PDF: ${finalError.message}`,
                duration: 4000,
              });
            }
          },
          pageSize,
          volunteerName
        );
        addToast({
          type: "success",
          title: `Print dialog opened for ${visitorCount} lanyard${
            visitorCount !== 1 ? "s" : ""
          } (${pageSize.toUpperCase()})`,
          duration: 4000,
        });
      } catch {
        // This should only happen if printDirect throws synchronously
        try {
          await LanyardPrintService.printLanyards(
            visitorCount,
            studentData?.name || studentId,
            pageSize
          );
          addToast({
            type: "success",
            title: `PDF fallback generated with ${visitorCount} lanyard${
              visitorCount !== 1 ? "s" : ""
            } (${pageSize.toUpperCase()})`,
            duration: 4000,
          });
        } catch (finalError) {
          addToast({
            type: "error",
            title: `Failed to print or generate PDF: ${finalError.message}`,
            duration: 4000,
          });
        }
      }
      setShowLanyardPreview(false);
      onReset(); // Reset the scanner after printing
    } catch (error) {
      addToast({
        type: "error",
        title: `Failed to print lanyards: ${error.message}`,
        duration: 4000,
      });
    }
  };

  return (
    <>
      <button
        className="confirm-btn"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading
          ? "Confirming..."
          : `✅ Confirm ${stage.charAt(0).toUpperCase() + stage.slice(1)}`}
      </button>
    </>
  );
};

export default ConfirmButton;
