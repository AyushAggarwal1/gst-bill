"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    firmName: "",
    address: "",
    gstNo: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            firmName: data.firmName || "",
            address: data.address || "",
            gstNo: data.gstNo || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      setSuccess("Profile saved successfully!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Account Information
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>This information is used for your account.</p>
              </div>
              <div className="mt-5 border-t border-gray-200 pt-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.name || "Not provided"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.email}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mt-5">
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Business Information
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    This information will be displayed on your bills and
                    invoices.
                  </p>
                </div>

                {success && (
                  <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                    {error}
                  </div>
                )}

                <div className="mt-5 space-y-6">
                  <div>
                    <label
                      htmlFor="firmName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Firm Name
                    </label>
                    <input
                      type="text"
                      name="firmName"
                      id="firmName"
                      value={profile.firmName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your company or business name"
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={profile.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your complete business address"
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gstNo"
                      className="block text-sm font-medium text-gray-700"
                    >
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNo"
                      id="gstNo"
                      value={profile.gstNo}
                      onChange={handleChange}
                      required
                      placeholder="22AAAAA0000A1Z5"
                      pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                      title="Please enter a valid GST Number (e.g., 22AAAAA0000A1Z5)"
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Format: 22AAAAA0000A1Z5
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : loading
                    ? "Loading..."
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 