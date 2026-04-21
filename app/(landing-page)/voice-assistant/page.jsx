// // File: app/components/VoiceAssistant.jsx
// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import Image from "next/image";

// // Demo NGO data
// const ngoData = {
//   donations: {
//     total: 150000,
//     lastMonth: 25000,
//     topDonors: ["John Smith", "Sarah Johnson", "Tech Corp"],
//   },
//   projects: {
//     active: 5,
//     completed: 12,
//     upcoming: 3,
//     impactMetrics: {
//       peopleHelped: 2500,
//       communitiesServed: 15,
//     },
//   },
//   volunteers: {
//     total: 150,
//     active: 85,
//     newSignups: 20,
//   },
// };

// const VoiceAssistant = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [liveTranscript, setLiveTranscript] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioChunks, setAudioChunks] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const chatEndRef = useRef(null);
//   const [error, setError] = useState(null);

//   // Text-to-Speech setup
//   const speak = (text) => {
//     if (!window.speechSynthesis) {
//       console.error("Speech synthesis not supported");
//       return;
//     }

//     // Cancel any ongoing speech
//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);

//     // Load voices and select a preferred one
//     const loadVoices = () => {
//       const voices = window.speechSynthesis.getVoices();
//       const preferredVoice =
//         voices.find(
//           (voice) =>
//             voice.name.includes("Samantha") ||
//             voice.name.includes("Female") ||
//             (voice.lang === "en-US" && voice.name.includes("Google"))
//         ) || voices.find((voice) => voice.lang === "en-US");

//       if (preferredVoice) {
//         utterance.voice = preferredVoice;
//       }
//     };

//     // Check if voices are already loaded
//     if (window.speechSynthesis.getVoices().length) {
//       loadVoices();
//     } else {
//       // If not, wait for them to load
//       window.speechSynthesis.onvoiceschanged = loadVoices;
//     }

//     utterance.rate = 1;
//     utterance.pitch = 1;
//     utterance.volume = 1;

//     window.speechSynthesis.speak(utterance);
//   };

//   // Get supported media recording MIME type
//   const getSupportedMimeType = () => {
//     const types = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];

//     for (const type of types) {
//       if (MediaRecorder.isTypeSupported(type)) {
//         return type;
//       }
//     }
//     return "audio/webm"; // Default fallback
//   };

//   // Setup WebSocket connection for real-time transcription
//   const setupRealtimeTranscription = () => {
//     // Close any existing connection
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       socket.close();
//     }

//     // Create a new WebSocket connection
//     const newSocket = new WebSocket(
//       "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000"
//     );
//     setSocket(newSocket);

//     // Connection opened
//     newSocket.onopen = () => {
//       console.log("WebSocket connection established");

//       // Send authorization message
//       newSocket.send(
//         JSON.stringify({
//           token: process.env.NEXT_PUBLIC_ASSEMBLYAI_TOKEN_FOR_CLIENT,
//           expires_in: 120, // Token expires in 2 minutes
//         })
//       );
//     };

//     // Listen for messages
//     newSocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       if (data.message_type === "FinalTranscript") {
//         setLiveTranscript(data.text);

//         // If recording has stopped and this is final message, process it
//         if (!isRecording && data.text && data.text.trim() !== "") {
//           setTranscript(data.text);
//         }
//       } else if (data.message_type === "PartialTranscript") {
//         setLiveTranscript(data.text);
//       } else if (data.message_type === "SessionBegins") {
//         console.log("Session began:", data);
//       } else if (data.message_type === "SessionTerminated") {
//         console.log("Session terminated:", data);
//       }
//     };

//     // Handle errors
//     newSocket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       setError("Error with transcription service. Please try again.");
//     };

//     // Handle connection close
//     newSocket.onclose = (event) => {
//       console.log("WebSocket connection closed:", event);

//       // Only show error if closed unexpectedly during recording
//       if (isRecording && !event.wasClean) {
//         setError(
//           "Connection to transcription service was lost. Please try again."
//         );
//         stopRecording();
//       }
//     };

//     return newSocket;
//   };

//   const startRecording = async () => {
//     try {
//       setError(null);
//       setLiveTranscript("");

//       // Get microphone access
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           channelCount: 1,
//           sampleRate: 16000,
//         },
//       });

//       // Setup real-time transcription
//       const ws = setupRealtimeTranscription();

//       // Create media recorder
//       const mimeType = getSupportedMimeType();
//       const recorder = new MediaRecorder(stream, { mimeType });

//       setMediaRecorder(recorder);
//       setAudioChunks([]);

//       // Process audio data as it becomes available
//       recorder.ondataavailable = async (event) => {
//         if (event.data.size > 0) {
//           // Store audio chunks for potential file upload later
//           setAudioChunks((chunks) => [...chunks, event.data]);

//           // Send to WebSocket if connection is open
//           if (ws.readyState === WebSocket.OPEN) {
//             // Convert Blob to ArrayBuffer for WebSocket transmission
//             const arrayBuffer = await event.data.arrayBuffer();

//             // Convert to the format required by AssemblyAI
//             const audioData = new Int16Array(arrayBuffer);
//             const audioBase64 = btoa(
//               String.fromCharCode(...new Uint8Array(audioData.buffer))
//             );

//             // Send audio data
//             ws.send(
//               JSON.stringify({
//                 audio_data: audioBase64,
//               })
//             );
//           }
//         }
//       };

//       // Start recording
//       recorder.start(250); // Collect data in small chunks
//       setIsRecording(true);
//     } catch (error) {
//       console.error("Microphone error:", error);

//       // Provide user-friendly error messages
//       if (error.name === "NotAllowedError") {
//         setError(
//           "Microphone access denied. Please allow microphone access in your browser settings."
//         );
//       } else if (error.name === "NotFoundError") {
//         setError(
//           "No microphone found. Please connect a microphone and try again."
//         );
//       } else if (error.name === "NotReadableError") {
//         setError(
//           "Your microphone is busy or not working properly. Please try again."
//         );
//       } else {
//         setError(`Error accessing microphone: ${error.message}`);
//       }
//     }
//   };

//   const stopRecording = async () => {
//     if (!mediaRecorder || mediaRecorder.state === "inactive") return;

//     try {
//       // Stop the media recorder
//       mediaRecorder.stop();
//       setIsRecording(false);
//       setIsProcessing(true);

//       // Close WebSocket after a short delay to get final transcripts
//       setTimeout(() => {
//         if (socket && socket.readyState === WebSocket.OPEN) {
//           socket.close();
//         }
//       }, 2000);

//       // Wait for final transcription or process accumulated transcript
//       setTimeout(() => {
//         if (liveTranscript.trim() !== "") {
//           processQuery(liveTranscript);
//         } else if (transcript.trim() !== "") {
//           processQuery(transcript);
//         } else {
//           setError("No speech detected. Please try again.");
//         }
//         setIsProcessing(false);
//       }, 2500);

//       // Stop all tracks on the stream
//       if (mediaRecorder.stream) {
//         mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//       }
//     } catch (error) {
//       console.error("Error stopping recording:", error);
//       setError("Error processing your voice. Please try again.");
//       setIsProcessing(false);
//     }
//   };

//   // For long recordings that need file-based transcription
//   const processAudioFile = async () => {
//     if (audioChunks.length === 0) return;

//     try {
//       setIsProcessing(true);

//       // Create audio blob
//       const audioBlob = new Blob(audioChunks, { type: getSupportedMimeType() });

//       // Create FormData to send the file
//       const formData = new FormData();
//       formData.append("audio", audioBlob, "recording.webm");

//       // Send to your Next.js API route
//       const response = await fetch("/api/transcribe", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to transcribe audio");
//       }

//       const data = await response.json();

//       if (data.text) {
//         processQuery(data.text);
//       } else {
//         throw new Error("No transcription received");
//       }
//     } catch (error) {
//       console.error("File transcription error:", error);
//       setError(error.message || "Error processing audio. Please try again.");
//     } finally {
//       setIsProcessing(false);
//       setAudioChunks([]);
//     }
//   };

//   const generateResponse = (query) => {
//     // Convert query to lowercase for easier matching
//     query = query.toLowerCase();

//     // Greetings and basic conversation
//     if (
//       query.includes("hello") ||
//       query.includes("hi ") ||
//       query.includes("hey")
//     ) {
//       return "Hello! I'm your NGO assistant. How can I help you today?";
//     }

//     if (query.includes("how are you")) {
//       return "I'm doing great, thank you for asking! I'm excited to help you with any information about our NGO. How can I assist you?";
//     }

//     if (query.includes("your name")) {
//       return "I'm the NGO Connect Assistant, but you can just call me Assistant. I'm here to help you with anything related to our organization!";
//     }

//     if (query.includes("thank you") || query.includes("thanks")) {
//       return "You're welcome! Is there anything else you'd like to know about our NGO?";
//     }

//     // NGO-specific responses
//     if (query.includes("donation")) {
//       if (query.includes("last month") || query.includes("recent")) {
//         return `Last month we received $${ngoData.donations.lastMonth} in donations, which is helping us make a real difference in our community.`;
//       }
//       if (query.includes("top") || query.includes("biggest")) {
//         return `Our most generous supporters include ${ngoData.donations.topDonors.join(", ")}. We're incredibly grateful for their continued support.`;
//       }
//       return `We've received total donations of $${ngoData.donations.total} so far. Every contribution helps us make a bigger impact in our community.`;
//     }

//     if (query.includes("project")) {
//       if (query.includes("active") || query.includes("current")) {
//         return `We currently have ${ngoData.projects.active} active projects making a difference right now. Would you like to know more about any specific project?`;
//       }
//       if (query.includes("impact") || query.includes("help")) {
//         return `Our projects have helped ${ngoData.projects.impactMetrics.peopleHelped} people across ${ngoData.projects.impactMetrics.communitiesServed} communities. Each person helped represents a life changed for the better.`;
//       }
//       return `We have ${ngoData.projects.active} active projects and have successfully completed ${ngoData.projects.completed} projects. We also have ${ngoData.projects.upcoming} exciting new initiatives in the pipeline.`;
//     }

//     if (query.includes("volunteer")) {
//       if (query.includes("new") || query.includes("recent")) {
//         return `We're excited to have ${ngoData.volunteers.newSignups} new volunteers who recently joined our cause. It's wonderful to see more people wanting to make a difference.`;
//       }
//       if (query.includes("active")) {
//         return `We currently have ${ngoData.volunteers.active} active volunteers dedicating their time and skills to our cause. They're the backbone of our organization.`;
//       }
//       return `We have a wonderful community of ${ngoData.volunteers.total} volunteers, with ${ngoData.volunteers.active} currently active members. Would you like to know how to get involved?`;
//     }

//     // If no specific match is found
//     return "I'm here to help with information about our NGO's donations, projects, and volunteers. Could you please rephrase your question, or would you like to know about any specific area of our work?";
//   };

//   const processQuery = async (query) => {
//     if (!query || query.trim() === "") return;

//     // Add user message to chat
//     const userMessage = {
//       type: "user",
//       text: query,
//       timestamp: new Date().toLocaleTimeString(),
//     };
//     setChatHistory((prev) => [...prev, userMessage]);

//     // Generate and speak AI response
//     const aiResponse = generateResponse(query);

//     // Add AI response to chat
//     const aiMessage = {
//       type: "ai",
//       text: aiResponse,
//       timestamp: new Date().toLocaleTimeString(),
//     };
//     setChatHistory((prev) => [...prev, aiMessage]);

//     // Speak the response
//     speak(aiResponse);

//     // Clear transcripts
//     setTranscript("");
//     setLiveTranscript("");
//   };

//   // Cleanup on component unmount
//   useEffect(() => {
//     return () => {
//       // Stop any ongoing speech
//       if (window.speechSynthesis) {
//         window.speechSynthesis.cancel();
//       }

//       // Close WebSocket connection
//       if (socket && socket.readyState === WebSocket.OPEN) {
//         socket.close();
//       }

//       // Stop recording if active
//       if (mediaRecorder && mediaRecorder.state === "recording") {
//         mediaRecorder.stop();

//         // Stop all tracks on the stream
//         if (mediaRecorder.stream) {
//           mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//         }
//       }
//     };
//   }, [mediaRecorder, socket]);

//   // Scroll to bottom of chat when new messages arrive
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="flex h-screen">
//         {/* Left side - Video cards */}
//         <div className="w-3/4 p-4 flex flex-col">
//           {/* AI Agent card */}
//           <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 p-4">
//             <div className="h-full flex flex-col items-center justify-center">
//               <div className="w-32 h-32 bg-blue-500 rounded-full mb-4 flex items-center justify-center">
//                 <span className="text-4xl text-white">AI</span>
//               </div>
//               <h2 className="text-xl font-semibold">NGO Assistant</h2>
//               {isRecording && (
//                 <div className="mt-4 text-green-500 flex items-center">
//                   <span className="mr-2 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
//                   Recording...
//                 </div>
//               )}
//               {isProcessing && (
//                 <div className="mt-4 text-blue-500 animate-pulse">
//                   Processing your message...
//                 </div>
//               )}
//               {error && <div className="mt-4 text-red-500">{error}</div>}
//             </div>
//           </div>

//           {/* User card */}
//           <div className="h-1/4 bg-white rounded-lg shadow-lg p-4">
//             <div className="h-full flex items-center justify-center">
//               <div className="text-center">
//                 <div className="w-20 h-20 bg-gray-300 rounded-full mb-2 flex items-center justify-center mx-auto">
//                   <span className="text-2xl">You</span>
//                 </div>
//                 {liveTranscript && (
//                   <div className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
//                     {liveTranscript}
//                   </div>
//                 )}
//                 <button
//                   onClick={isRecording ? stopRecording : startRecording}
//                   disabled={isProcessing}
//                   className={`mt-4 px-6 py-2 rounded-full text-white font-semibold ${
//                     isRecording
//                       ? "bg-red-500 hover:bg-red-600"
//                       : isProcessing
//                         ? "bg-gray-400"
//                         : "bg-blue-500 hover:bg-blue-600"
//                   } transition-colors`}
//                 >
//                   {isRecording
//                     ? "Stop"
//                     : isProcessing
//                       ? "Processing..."
//                       : "Start Speaking"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right side - Chat */}
//         <div className="w-1/4 bg-white border-l border-gray-200">
//           <div className="h-full flex flex-col">
//             <div className="p-4 border-b border-gray-200">
//               <h2 className="text-lg font-semibold">Conversation</h2>
//             </div>

//             {/* Chat messages */}
//             <div className="flex-1 overflow-y-auto p-4">
//               <div className="space-y-4">
//                 {chatHistory.length === 0 ? (
//                   <div className="text-center text-gray-500 mt-8">
//                     <p>Your conversation will appear here.</p>
//                     <p className="text-sm mt-2">
//                       Try asking about our donations, projects, or volunteers!
//                     </p>
//                   </div>
//                 ) : (
//                   chatHistory.map((message, index) => (
//                     <div
//                       key={index}
//                       className={`flex ${
//                         message.type === "user"
//                           ? "justify-end"
//                           : "justify-start"
//                       }`}
//                     >
//                       <div
//                         className={`max-w-[80%] rounded-lg p-3 ${
//                           message.type === "user"
//                             ? "bg-blue-500 text-white"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         <p className="text-sm">{message.text}</p>
//                         <p className="text-xs mt-1 opacity-75">
//                           {message.timestamp}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 )}
//                 <div ref={chatEndRef} />
//               </div>
//             </div>

//             {/* Live transcription area */}
//             {liveTranscript && isRecording && (
//               <div className="p-4 border-t border-gray-200 bg-gray-50">
//                 <p className="text-sm text-gray-600 italic">{liveTranscript}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VoiceAssistant;
