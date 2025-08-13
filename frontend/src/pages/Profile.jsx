import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Profile.css";
import API_BASE_URL from "../utils/api";

const Profile = () => {
  // read user safely
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());
  const [form, setForm] = useState({ name: "", email: "" });
  const [banner, setBanner] = useState({ text: "", ok: true });

  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "" });
  }, [user]);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const getAvatar = (src) => {
    if (!src) return "https://placehold.co/96x96?text=Avatar";
    if (typeof src === "string") {
      if (/^https?:\/\//i.test(src)) return src;
      return `${API_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
    }
    if (src?.url) return src.url;
    return "https://placehold.co/96x96?text=Avatar";
  };

  const setMsg = (text, ok = true) => setBanner({ text, ok });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/${user.id}`, form, {
        headers: { ...authHeader },
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setMsg("Profile updated!", true);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      setMsg(err?.response?.data?.error || "Failed to update profile.", false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setImageUploading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/users/${user.id}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data", ...authHeader },
          onUploadProgress: (pe) => {
            if (!pe.total) return;
            setUploadProgress(Math.round((pe.loaded * 100) / pe.total));
          },
        }
      );

      const updatedUser = { ...user, profilePicture: res.data.image };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMsg("Profile picture updated!", true);
    } catch (err) {
      console.error("Upload error:", err);
      setMsg(err?.response?.data?.error || "Failed to upload profile picture.", false);
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${user.id}/remove-picture`, {
        headers: { ...authHeader },
      });
      const updatedUser = { ...user, profilePicture: "" };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMsg("Profile picture removed.", true);
    } catch (err) {
      console.error("Remove error:", err);
      setMsg(err?.response?.data?.error || "Failed to remove profile picture.", false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setMsg("All password fields are required.", false);
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return setMsg("New password must be 8+ chars and include a letter and a number.", false);
    }
    if (newPassword !== confirmPassword) {
      return setMsg("New passwords do not match.", false);
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/users/${user.id}/change-password`,
        { oldPassword, newPassword },
        { headers: { ...authHeader } }
      );
      setMsg(res.data?.message || "Password changed.", true);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      console.error("Password change failed:", err);
      setMsg(err?.response?.data?.error || "Failed to change password.", false);
    }
  };

  if (!user) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl p-10 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-semibold mb-2">Please log in to view your profile.</h2>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white p-6 md:p-8 rounded-xl ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] fade-in">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-6">Your Profile</h2>

          {/* Avatar + Upload */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={getAvatar(user.profilePicture)}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover ring-1 ring-black/5"
            />
            <div className="flex items-center gap-2">
              <label
                htmlFor="avatar-input"
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
              >
                Change photo
              </label>
              <input
                id="avatar-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {user.profilePicture && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {imageUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* View or Edit */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setForm({ name: user.name || "", email: user.email || "" });
                  }}
                  className="bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-gray-500">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Toggle password form */}
          <button
            type="button"
            onClick={() => setShowPasswordForm((v) => !v)}
            className="mt-6 text-sm text-indigo-600 hover:underline"
          >
            {showPasswordForm ? "Cancel password change" : "Change password"}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3 fade-in">
              <div>
                <label className="block text-sm font-medium mb-1">Old Password</label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-12"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, oldPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
                  >
                    {showOld ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-12"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use at least 8 characters, including a letter and a number.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-12"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Save Password
              </button>
            </form>
          )}

          {/* Banner */}
          {banner.text && (
            <div
              className={`mt-6 border rounded-lg px-4 py-3 text-sm ${
                banner.ok
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {banner.text}
            </div>
          )}

          {/* Placeholder for future sections */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Account</h3>
            <p className="text-sm text-gray-500">
              Order history and saved items coming soon.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
