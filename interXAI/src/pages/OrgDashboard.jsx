"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import { getAuthToken } from "../utils/handleToken";
import { Loader2, Pencil } from "lucide-react";
import { toast} from 'react-toastify';



export default function OrgDashboard() {
  const [orgData, setOrgData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [viewerType, setViewerType] = useState("guest");
  const [interviews, setInterviews] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = getAuthToken();
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/organization/org/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch organization data");
        return res.json();
      })
      .then((data) => {
        setOrgData(data);
        setFormData(data);
        setTimeout(() => setVisible(true), 200);
      })
      .catch(() => toast.error("Could not load organization details."))
      .finally(() => setLoading(false));

    if (token) {
      fetch(`${API_URL}/organization/check-org/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          if (data.is_organization) {
            setViewerType("owner");
            fetch(`${API_URL}/interview/get-interviews/`, {
              headers: { Authorization: `Token ${token}` },
            })
              .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch interviews");
                return res.json();
              })
              .then((data) => {
                // Add `hasApplications` flag for each interview
                const fetchApplications = async () => {
                  const updated = await Promise.all(
                    data.map(async (interview) => {
                      try {
                        const res = await fetch(
                          `${API_URL}/interview/get-applications/${interview.id}/`,
                          { headers: { Authorization: `Token ${token}` } }
                        );
                        if (res.ok) {
                          const apps = await res.json();
                          return { ...interview, hasApplications: apps.length > 0 };
                        }
                      } catch (err) {
                        console.error("Error checking applications", err);
                      }
                      return { ...interview, hasApplications: false };
                    })
                  );
                  setInterviews(updated);
                };
                fetchApplications();
              })
              .catch(() => toast.error("Could not load interviews."));
          } else {
            setViewerType("guest");
          }
        })
        .catch(() => setViewerType("guest"));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (field) => {
    const token = getAuthToken();
    if (viewerType !== "owner") return;

    try {
      const res = await fetch(`${API_URL}/organization/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ [field]: formData[field] }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrgData((prev) => ({ ...prev, [field]: formData[field] }));
        setEditingField(null);
      } else {
        toast.error("Update failed: " + JSON.stringify(data));
      }
    } catch {
      toast.error("Server error while updating.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header viewerType={viewerType} />
        <div className="min-h-screen flex items-center justify-center text-gray-900">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading organization data...
        </div>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header viewerType={viewerType} />
        <div className="min-h-screen flex items-center justify-center text-red-500">
          Organization not found.
        </div>
      </div>
    );
  }

  const { email, orgname, address, photo, Description } = orgData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use your existing header */}
      <Header viewerType={viewerType} />

      {/* Updated main content with lighter theme to match the UI */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className={`max-w-5xl w-full transform transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-shimmer"></div>

            <div className="flex flex-col items-center space-y-6">
              {viewerType === "owner" && editingField === "photo" ? (
                <div className="flex flex-col items-center">
                  <input type="text" name="photo" value={formData.photo} onChange={handleChange} className="bg-gray-100 text-gray-900 p-2 rounded mb-2 border border-gray-300" />
                  <button onClick={() => handleSave("photo")} className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition">Save</button>
                </div>
              ) : (
                <img src={photo} alt="Organization Logo" className={`w-28 h-28 rounded-full border-2 border-purple-500 shadow-lg ${viewerType === "owner" ? "cursor-pointer" : ""}`} onClick={() => viewerType === "owner" && setEditingField("photo")} />
              )}

              <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                {viewerType === "owner" && editingField === "orgname" ? (
                  <>
                    <input type="text" name="orgname" value={formData.orgname} onChange={handleChange} className="bg-gray-100 text-gray-900 p-2 rounded border border-gray-300" />
                    <button onClick={() => handleSave("orgname")} className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition">Save</button>
                  </>
                ) : (
                  <>
                    {orgname}
                    {viewerType === "owner" && <Pencil className="w-4 h-4 cursor-pointer text-gray-600 hover:text-purple-600" onClick={() => setEditingField("orgname")} />}
                  </>
                )}
              </h1>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-purple-600 font-semibold">Email:</span> {email}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-purple-600 font-semibold">Address:</span>
                  {viewerType === "owner" && editingField === "address" ? (
                    <>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} className="bg-gray-100 text-gray-900 p-1 rounded ml-2 border border-gray-300" />
                      <button onClick={() => handleSave("address")} className="text-xs bg-purple-600 text-white px-2 py-1 rounded ml-2 hover:bg-purple-700 transition">Save</button>
                    </>
                  ) : (
                    <>
                      <span>{address}</span>
                      {viewerType === "owner" && <Pencil className="w-4 h-4 cursor-pointer text-gray-600 hover:text-purple-600" onClick={() => setEditingField("address")} />}
                    </>
                  )}
                </p>

                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-purple-600 font-semibold">Description:</span>
                  {viewerType === "owner" && editingField === "Description" ? (
                    <div className="flex flex-col w-full">
                      <textarea name="Description" value={formData.Description} onChange={handleChange} rows={3} className="bg-gray-100 text-gray-900 p-2 rounded w-full mt-1 border border-gray-300" />
                      <button onClick={() => handleSave("Description")} className="text-sm bg-purple-600 text-white px-3 py-1 rounded mt-2 self-end hover:bg-purple-700 transition">Save</button>
                    </div>
                  ) : (
                    <span className="flex-1">
                      {Description || "No description provided."}
                      {viewerType === "owner" && <Pencil className="w-4 h-4 cursor-pointer ml-2 text-gray-600 hover:text-purple-600" onClick={() => setEditingField("Description")} />}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {viewerType === "owner" && interviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4 text-purple-600">Your Interviews</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {interviews.map((interview) => (
                  <div key={interview.id} className="bg-white/80 p-6 rounded-xl border border-gray-200/50 shadow-md space-y-3">
                    <p className="text-gray-700"><span className="text-purple-600 font-medium">Post:</span> {interview.post}</p>
                    <p className="text-gray-700"><span className="text-purple-600 font-medium">Description:</span> {interview.desc}</p>
                    <p className="text-gray-700"><span className="text-purple-600 font-medium">Experience:</span> {interview.experience} years</p>
                    <p className="text-gray-700"><span className="text-purple-600 font-medium">Deadline:</span> {interview.submissionDeadline}</p>
                    <button onClick={() => navigate(`/interview/${interview.id}?orgId=${id}`)} className="mt-2 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition">
                      Edit Interview
                    </button>
                    {interview.hasApplications && (
                      <button onClick={() => navigate(`/applications/${interview.id}`)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition ml-2">
                        View Applications
                      </button>
                    )}
                    <button onClick={() => navigate(`/leaderboard/${interview.id}`)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition ml-2">
                        View Leaderboard
                      </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}