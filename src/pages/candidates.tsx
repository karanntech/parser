'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCandidateStore } from "@/store/useCandidateStore";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function CandidatesPage() {
  const { candidates } = useCandidateStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  const router = useRouter();

  useEffect(() => {
    if (candidates.length === 0) {
      router.replace("/");
    }
  }, [candidates, router]);

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-1/3 bg-gray-200 p-6 space-y-4 overflow-y-auto text-black">
        <h2 className="text-2xl font-semibold mb-4">Candidates</h2>
        {candidates.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`bg-white rounded-lg p-4 cursor-pointer shadow ${
              selectedId === c.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-gray-600">{c.email}</p>
            <div className="float-right mt-1 text-xs bg-blue-600 rounded-full px-2 py-1">
              Score: {c.score}
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div className="w-2/3 p-8 bg-gray-100 relative text-black">
        {selectedCandidate ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedCandidate.name}
                </h2>
                <p className="text-gray-500">{selectedCandidate.location}</p>
                <p className="mt-2 text-sm">{selectedCandidate.email}</p>
                <div className="flex gap-2 mt-2">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded cursor-pointer">
                    Message
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-1 rounded cursor-pointer">
                    Call
                  </button>
                </div>
              </div>

              <div className="space-x-2">
                <button className="bg-white text-black p-2 rounded cursor-pointer hover:bg-blue-300">
                  <FaCheck />
                </button>
                <button className="bg-white text-black p-2 rounded cursor-pointer hover:bg-blue-300">
                  <FaTimes />
                </button>
              </div>
            </div>

            <hr className="my-6" />

            <div className="flex justify-between items-center mb-2">
              <p className="text-3xl font-bold">Resume</p>
              <a
                href={selectedCandidate.resumeUrl || "#"}
                download
                className="text-sm text-gray-600 underline"
              >
                Download
              </a>
            </div>

            {/* <div className="bg-gray-400 text-white w-full h-96 flex items-center justify-center rounded">
              Resume
            </div> */}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a candidate to view details
          </div>
        )}
      </div>
    </div>
  );
}
