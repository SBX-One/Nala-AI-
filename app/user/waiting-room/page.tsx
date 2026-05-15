"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import InformationBar from "@/components/partials/informationBarActiveMeeting";

interface Psychiatrist {
  name: string;
  specialization: string;
  experience: number;
  patient_count: number;
  description: string;
  expertises: string[];
  photo_url?: string;
}

function DeviceTestModal({
  isOpen,
  onClose,
  stream,
}: {
  isOpen: boolean;
  onClose: () => void;
  stream: MediaStream | null;
}) {
  const [micLevel, setMicLevel] = useState(0);
  const [isLoopback, setIsLoopback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Audio Visualizer + Loopback
  useEffect(() => {
    if (!isOpen || !stream) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks[0].enabled) return;

    let audioContext: AudioContext;
    try {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();

      analyser.fftSize = 256;

      // Source → Analyser (for visualization)
      source.connect(analyser);

      // Source → GainNode → Destination (for loopback/hearing yourself)
      source.connect(gainNode);
      gainNode.gain.value = 0; // Start silent, user toggles on
      gainNode.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setMicLevel(average);
        animationIdRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error("Visualizer error:", err);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      analyserRef.current = null;
      gainNodeRef.current = null;
      sourceRef.current = null;
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isOpen, stream]);

  // Toggle loopback (hear yourself)
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isLoopback ? 1.0 : 0;
    }
  }, [isLoopback]);

  // Video preview
  useEffect(() => {
    if (isOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream]);

  const playTestSound = () => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.play();
  };

  if (!isOpen) return null;

  const isMicDisabled = !stream?.getAudioTracks().some((t) => t.enabled);
  const isCamDisabled = !stream
    ?.getVideoTracks()
    .some((t) => t.readyState === "live");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-border-default flex items-center justify-between">
          <h2 className="text-heading-6-bold text-text-heading">
            Device Settings & Test
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-default rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 6L6 18M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 grid gap-8 overflow-y-auto max-h-[80vh]">
          {/* Camera Section */}
          <div className="grid gap-4">
            <p className="text-label-base-bold text-text-subheading uppercase tracking-wider">
              Camera Test
            </p>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              {!isCamDisabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-body-sm-medium">
                  Camera is disabled
                </div>
              )}
            </div>
          </div>

          {/* Audio Input Section */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <p className="text-label-base-bold text-text-subheading uppercase tracking-wider">
                Microphone Test
              </p>
              {isMicDisabled && (
                <span className="text-error-default text-label-small-medium">
                  Microphone is Muted
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 bg-surface-default p-4 rounded-2xl">
              <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner flex items-center px-1">
                <div
                  className="h-1.5 bg-primary-default rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(micLevel * 1.5, 100)}%` }}
                />
              </div>
            </div>
            {/* Loopback Toggle */}
            <button
              onClick={() => setIsLoopback(!isLoopback)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isLoopback ? "bg-primary-50 border-primary-default text-primary-700" : "bg-surface-default border-border-default text-text-subheading hover:bg-surface-disabled"}`}
            >
              <div
                className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${isLoopback ? "border-primary-default bg-primary-default" : "border-border-default"}`}
              >
                {isLoopback && <div className="size-2 rounded-full bg-white" />}
              </div>
              <div className="text-left">
                <p className="text-body-sm-bold">Hear Myself</p>
                <p className="text-body-caption-medium text-text-subheading">
                  Play back your microphone audio through speakers
                </p>
              </div>
            </button>
            <p className="text-body-caption-medium text-text-subheading italic">
              Speak to see the volume indicator move. Toggle &quot;Hear
              Myself&quot; to listen to your mic output.
            </p>
          </div>

          {/* Audio Output Section */}
          <div className="grid gap-4">
            <p className="text-label-base-bold text-text-subheading uppercase tracking-wider">
              Speaker Test
            </p>
            <button
              onClick={playTestSound}
              className="flex items-center gap-4 bg-surface-default p-4 rounded-2xl hover:bg-surface-disabled transition-all text-left"
            >
              <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-body-base-bold text-text-heading">
                  Play Test Sound
                </p>
                <p className="text-body-sm-medium text-text-subheading">
                  Click to verify your speakers are working.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="px-8 py-6 bg-surface-default flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-primary-default text-white rounded-xl text-label-base-bold hover:bg-primary-dark shadow-lg shadow-primary-100 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function WaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultationId = Number(searchParams.get("consultationId")) || Number(searchParams.get("roomId")) || 0;

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeLeft, setTimeLeft] = useState(1200); // Default, will be updated from start_time
  const [psychiatrist, setPsychiatrist] = useState<Psychiatrist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>("");
  const [meetingRoomId, setMeetingRoomId] = useState<number | null>(null);
  const [meetingRoomExists, setMeetingRoomExists] = useState(false);

  // Unified Media Logic
  useEffect(() => {
    let mounted = true;
    let localStream: MediaStream | null = null;

    async function initMedia() {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch (err) {
          console.warn(
            "Could not get both video and audio. Trying audio only.",
            err,
          );
          setIsCameraOff(true);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (audioErr) {
            console.warn(
              "Could not get audio either. Trying video only.",
              audioErr,
            );
            setIsMuted(true);
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: true,
              });
              setIsCameraOff(false); // We got video
            } catch (videoErr) {
              console.warn("Could not get any media devices.", videoErr);
              setIsCameraOff(true);
              setIsMuted(true);
            }
          }
        }

        if (!mounted) {
          if (stream) stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (stream) {
          localStream = stream;
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          stream
            .getAudioTracks()
            .forEach((track) => (track.enabled = !isMuted));
          if (isCameraOff) {
            stream.getVideoTracks().forEach((track) => {
              track.stop();
              stream.removeTrack(track);
            });
          }
        }
      } catch (err) {
        console.warn("Error accessing media devices:", err);
        setIsCameraOff(true);
        setIsMuted(true);
      }
    }

    initMedia();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Empty dependency array to prevent infinite loop

  const handleToggleMic = async () => {
    const nextMuted = !isMuted;

    if (!mediaStream && !nextMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMediaStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsMuted(false);
      } catch (err) {
        console.warn("Failed to get audio:", err);
        alert("Microphone access denied or device not found. Please check your browser permissions or hardware.");
      }
    } else if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = !nextMuted;
        });
        setIsMuted(nextMuted);
      } else if (!nextMuted) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          mediaStream.addTrack(stream.getAudioTracks()[0]);
          if (videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = mediaStream;
          }
          setMediaStream(new MediaStream(mediaStream.getTracks()));
          setIsMuted(false);
        } catch (err) {
          console.warn("Failed to get audio:", err);
          alert("Microphone access denied or device not found. Please check your browser permissions or hardware.");
        }
      } else {
        setIsMuted(true);
      }
    }
  };

  const handleToggleCamera = async () => {
    const nextCameraOff = !isCameraOff;

    if (nextCameraOff) {
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach((track) => {
          track.stop();
          mediaStream.removeTrack(track);
        });
        setMediaStream(new MediaStream(mediaStream.getTracks()));
      }
      setIsCameraOff(true);
    } else {
      if (
        mediaStream &&
        mediaStream.getVideoTracks().some((t) => t.readyState === "live")
      ) {
        setIsCameraOff(false);
        return;
      }
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (!mediaStream) {
          setMediaStream(newStream);
          if (videoRef.current) videoRef.current.srcObject = newStream;
        } else {
          mediaStream.addTrack(newVideoTrack);
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
          setMediaStream(new MediaStream(mediaStream.getTracks()));
        }
        setIsCameraOff(false);
      } catch (err) {
        console.warn("Error restarting camera:", err);
        alert("Camera access denied or device not found. Please check your browser permissions or hardware.");
      }
    }
  };

  // Data Loading & Real-time Subscription
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadData() {
      if (!consultationId) return;

      const { data: consultation } = await supabase
        .from("Consultation")
        .select(`
          *,
          psychiatrist:PsychiatristProfile (
            *,
            expertises:PsychiatristExpertise (
              expertise:Expertise (name)
            )
          )
        `)
        .eq("id", consultationId)
        .single();

      if (consultation && mounted) {
        if (consultation.date && consultation.start_time) {
          const startDateTimeStr = `${consultation.date}T${consultation.start_time}`;
          const startTime = new Date(startDateTimeStr).getTime();
          const now = new Date().getTime();
          const diffInSeconds = Math.max(
            0,
            Math.floor((startTime - now) / 1000),
          );
          setTimeLeft(diffInSeconds);
        } else {
          setTimeLeft(0);
        }

        if (consultation.psychiatrist) {
          const p = consultation.psychiatrist;
          setPsychiatrist({
            name: p.name || "Dr. Anonymous",
            specialization: p.specialization || "General Psychiatrist",
            experience: 10,
            patient_count: 1200,
            description: p.description || "No description available",
            expertises: p.expertises?.map((e: any) => e.expertise.name) || [],
            photo_url: p.photo_url,
          });
        }

        const { data: room } = await supabase
          .from("MeetingRoom")
          .select("id, status")
          .eq("user_id", consultation.user_id)
          .eq("psychiatrist_id", consultation.psychiatrist_id)
          .neq("status", "finished")
          .limit(1)
          .single();

        if (room) {
          setMeetingRoomId(room.id);
          setRoomStatus(room.status);
          setMeetingRoomExists(true);
        } else {
          setMeetingRoomExists(false);
        }
      }
      if (mounted) setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [consultationId, router]);

  useEffect(() => {
    if (!meetingRoomId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`room-${meetingRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "MeetingRoom",
          filter: `id=eq.${meetingRoomId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setRoomStatus(newStatus);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingRoomId, router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Fallback Polling if timer hits 0 but room doesn't exist yet
  useEffect(() => {
    if (timeLeft <= 0 && !meetingRoomExists && !loading && consultationId) {
      const interval = setInterval(async () => {
        const supabase = createClient();
        const { data: consultation } = await supabase
          .from("Consultation")
          .select("user_id, psychiatrist_id")
          .eq("id", consultationId)
          .single();

        if (consultation) {
          const { data: room } = await supabase
            .from("MeetingRoom")
            .select("id, status")
            .eq("user_id", consultation.user_id)
            .eq("psychiatrist_id", consultation.psychiatrist_id)
            .neq("status", "finished")
            .limit(1)
            .single();

          if (room) {
            setMeetingRoomId(room.id);
            setRoomStatus(room.status);
            setMeetingRoomExists(true);
          }
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, meetingRoomExists, loading, consultationId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    const cleanName = name.replace(/^Dr\.?\s+/i, "");
    const parts = cleanName.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return cleanName.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-background">
        <div className="size-12 rounded-full border-4 border-primary-default border-t-transparent animate-spin" />
      </div>
    );
  }

  const isJoinEnabled = timeLeft <= 0 && meetingRoomExists && roomStatus === "on_going";

  return (
    <div className="min-h-screen w-full bg-surface-background flex flex-col">
      <InformationBar />

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-5xl w-full flex flex-col lg:flex-row items-start gap-8 justify-center">
          {/* Left: Video Preview Section */}
          <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
            <div className="relative w-full lg:w-[500px] aspect-4/3 bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isCameraOff ? "opacity-0" : "opacity-100"}`}
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-disabled text-text-placeholder gap-4">
                  <div className="size-20 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-10"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zM16 18H4V6h12v12z"
                      />
                    </svg>
                  </div>
                  <p className="text-body-lg-medium">Camera is off</p>
                </div>
              )}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all border border-white/30"
                  title="Test Devices"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41c0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                    />
                  </svg>
                </button>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4  rounded-3xl px-4 py-2 border border-border-default">
              <button
                onClick={handleToggleMic}
                className={`size-12 rounded-full flex items-center justify-center transition-all border ${isMuted ? "bg-button-error text-white border-transparent" : "border-border-default bg-surface-default text-text-heading hover:bg-surface-disabled"}`}
              >
                {isMuted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l6.02 6zM4.41 2.86L3 4.27l6 6V11c0 1.66 1.34 3 3 3c.23 0 .44-.03.65-.08l2.39 2.39c-.97.43-2.06.69-3.21.69c-2.8 0-5.41-1.66-6.66-4h-2.1c1.3 3.33 4.41 5.7 8.01 5.94V22h4v-3.03c.87-.13 1.71-.41 2.48-.82l3.29 3.29l1.41-1.41L4.41 2.86z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                    />
                    <path
                      fill="currentColor"
                      d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleToggleCamera}
                className={`size-12 rounded-full flex items-center justify-center transition-all border ${isCameraOff ? "bg-button-error text-white border-transparent" : "border-border-default bg-surface-default text-text-heading hover:bg-surface-disabled"}`}
              >
                {isCameraOff ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27L4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21L21 19.73L3.27 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={() => router.push("/user")}
                className="button-error-rounded"
                title="Exit Waiting Room"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5m4 13l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Info and Timer Section */}
          <div className="flex flex-col gap-6 flex-1 w-full max-w-md">
            {/* Doctor Card */}
            {psychiatrist && (
              <div className="bg-white border border-border-default rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-surface-disabled size-22.5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {psychiatrist.photo_url ? (
                      <img
                        src={psychiatrist.photo_url}
                        alt={psychiatrist.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-4-bold">
                        {getInitials(psychiatrist.name)}
                      </div>
                    )}
                  </div>
                  <div className="w-fit grid gap-3">
                    <div>
                      <p className="text-body-xl-semibold">
                        {psychiatrist.name}
                      </p>
                      <p className="text-body-sm-semibold text-text-action">
                        {psychiatrist.specialization}
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <p className="text-label-caption-semibold text-text-subheading whitespace-nowrap">
                        {psychiatrist.experience} Years exp.
                      </p>
                      <p className="text-label-caption-semibold text-text-subheading whitespace-nowrap">
                        {psychiatrist.patient_count} Patients
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex gap-2 flex-wrap">
                    {psychiatrist.expertises.map((e, idx) => (
                      <span
                        key={idx}
                        className="text-label-small-medium px-2 py-1 rounded-sm bg-surface-primary-light text-text-action"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-label-caption-bold text-text-subheading mb-1">
                    Description
                  </p>
                  <p className="text-body-sm-medium text-text-body line-clamp-2">
                    {psychiatrist.description}
                  </p>
                </div>
              </div>
            )}

            {/* Timer Card */}
            <div className="bg-white border border-border-default rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-sm">
              <p className="text-body-xl-medium text-text-subheading ">
                Your Session will begin soon
              </p>
              <h2 className="text-display-bold text-text-body leading-none tabular-nums">
                {formatTime(timeLeft)}
              </h2>
              <div className="flex gap-4 w-full">
                <button
                  className="button-secondary-large flex-1 justify-center"
                  onClick={() => window.location.reload()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>
                  Refresh
                </button>
                <button
                  disabled={!isJoinEnabled}
                  className={`flex-1 justify-center ${!isJoinEnabled ? "button-disabled-large" : "button-primary-large"}`}
                  onClick={() => {
                    if (meetingRoomId) router.push(`/user/active-Consultation?roomId=${meetingRoomId}`);
                  }}
                >
                  {!isJoinEnabled && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
                      />
                    </svg>
                  )}
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DeviceTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        stream={mediaStream}
      />
    </div>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WaitingRoomContent />
    </Suspense>
  );
}
