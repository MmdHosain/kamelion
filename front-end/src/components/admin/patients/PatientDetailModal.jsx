import React, { useState } from "react";
import { X } from "lucide-react";
import { adminApi } from "../../../api/admin";
import { getApiErrorMessage } from "../../../utils/errorUtils";

const formatDateTime = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// AI Profile fields config — label + key into patient.aiProfile
const AI_FIELDS = [
  { label: "Risk Level",        key: "riskLevel" },
  { label: "Chronic Condition", key: "chronicCondition" },
  { label: "Recommendation",    key: "recommendation" },
  { label: "Med Adherence",     key: "medAdherence" },
  { label: "Lifestyle",         key: "lifestyle" },
];

const PatientDetailModal = ({ patient, onClose }) => {
  const [notes, setNotes] = useState(patient?.notes || []);
  const [noteInput, setNoteInput] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  if (!patient) return null;

  const aiProfile     = patient.aiProfile     || {};
  const appointments  = patient.appointments  || [];

  const handleAddNote = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;

    setIsSubmittingNote(true);
    setNoteError("");

    try {
      // Sending the newly created note to backend
      const newNoteRes = await adminApi.addPatientNote(patient.id, trimmed);
      
      const newNote = {
        id: newNoteRes?.id || Date.now(),
        text: newNoteRes?.text || trimmed,
        createdAt: newNoteRes?.createdAt || formatDateTime(new Date()),
      };

      setNotes((prev) => [newNote, ...prev]);
      setNoteInput("");
    } catch (err) {
      setNoteError(getApiErrorMessage(err, "Failed to save note."));
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal box */}
        <div
          className="relative bg-gray-50 rounded-2xl shadow-2xl w-[92vw] max-w-5xl max-h-[88vh] flex flex-col p-6 gap-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-primary">{patient.fullName}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{patient.phoneNumber}</p>
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">

            {/* ── Notes ── */}
            <div className="custom-scroll-wrapper bg-white border border-gray-100 rounded-xl flex flex-col p-4 gap-3 min-h-0">
              <h3 className="text-sm font-bold text-gray-700 shrink-0">Notes</h3>

              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleAddNote()}
                placeholder="Write a note..."
                rows={4}
                disabled={isSubmittingNote}
                className="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              
              {noteError && (
                <span className="text-xs text-red-500 font-medium">
                  {noteError}
                </span>
              )}

              <button
                onClick={handleAddNote}
                disabled={isSubmittingNote}
                className="w-full bg-primary hover:bg-primaryHover text-white text-sm font-medium py-2 rounded-lg transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingNote ? "Adding..." : "Add"}
              </button>

              <div className="custom-scroll flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
                {notes.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center mt-4">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shrink-0"
                    >
                      <span className="text-[10px] text-gray-400 self-end">{note.createdAt}</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── AI Profile ── */}
            <div className="custom-scroll-wrapper bg-white border border-gray-100 rounded-xl flex flex-col p-4 gap-0 min-h-0">
              <h3 className="text-sm font-bold text-gray-700 mb-3 shrink-0">AI Profile</h3>

              <div className="custom-scroll flex-1 overflow-y-auto min-h-0">
                {AI_FIELDS.map(({ label, key }, i) => (
                  <div
                    key={key}
                    className={`py-3 ${i < AI_FIELDS.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {aiProfile[key] || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Appointment History ── */}
            <div className="custom-scroll-wrapper bg-white border border-gray-100 rounded-xl flex flex-col p-4 min-h-0">
              <h3 className="text-sm font-bold text-gray-700 mb-3 shrink-0">Appointment History</h3>

              <div className="custom-scroll flex-1 overflow-y-auto min-h-0">
                {appointments.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center mt-4">No appointments</p>
                ) : (
                  appointments.map((appt, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-3 ${
                        i < appointments.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <span className="text-sm text-gray-700">{appt.date}</span>
                      <span className="text-sm text-gray-500">{appt.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetailModal;
