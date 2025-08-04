"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

type Record = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  recordedAt: string;
  person: number; // Keep 'person' as number, matching your Prisma model
};

export default function Home() {
  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    notes: "",
    person: "1", // This will be updated by selectedPerson on submission
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedPerson, setSelectedPerson] = useState("1"); // State to control which person's data is displayed/fetched

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure the 'person' field in the form state reflects the currently selected person
    // This is crucial for saving new records to the correct person.
    const submissionForm = { ...form, person: selectedPerson };

    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionForm), // Send the form with the correct person ID
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Record saved successfully!");
      setIsError(false);
      setForm({ systolic: "", diastolic: "", pulse: "", notes: "", person: selectedPerson }); // Reset form, keeping selected person
    } else {
      setMessage(`❌ Error: ${data.error}`);
      setIsError(true);
    }
  };

  const fetchRecords = async () => {
    // Fetch records specifically for the selected person
    const res = await fetch(`/api/records?personId=${selectedPerson}`);
    const data = await res.json();
    setRecords(data);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch("/api/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setMessage("🗑️ Record deleted");
      setIsError(false);
      fetchRecords(); // Re-fetch records after deletion to update the displayed list
    } else {
      const data = await res.json();
      setMessage(`❌ Delete failed: ${data.error}`);
      setIsError(true);
    }
  };

  const convertToGmt8 = (dateString: string) => {
    const date = new Date(dateString);
    // Use 'en-GB' locale for day/month/year format, and 'Asia/Kuala_Lumpur' for GMT+8
    return date.toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur" });
  };

  const handleExport = () => {
    // Records are already filtered by fetchRecords when selectedPerson changes,
    // so `records` state already contains only the current person's data.
    const exportData = records.map((record) => ({
      ID: record.id,
      Systolic: record.systolic,
      Diastolic: record.diastolic,
      Pulse: record.pulse ?? "",
      Notes: record.notes ?? "",
      "Recorded At": convertToGmt8(record.recordedAt),
    }));

    const userName = selectedPerson === "1" ? "Abu Hanifah" : "Mazliah Othman";
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${userName}_Records`);
    XLSX.writeFile(workbook, `blood_pressure_records_${userName.replace(/\s/g, '_')}.xlsx`);
  };

  // Effect to fetch records when selectedPerson changes
  useEffect(() => {
    fetchRecords();
  }, [selectedPerson]); // Dependency array includes selectedPerson

  // Effect for message timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Effect to refetch records after a successful save/delete (when message appears and is not an error)
  useEffect(() => {
    if (message && !isError) fetchRecords();
  }, [message, isError]); // Added isError to dependency array to prevent refetch on error messages

  const handleLogout = async () => {
    // Assuming /api/logout handles session invalidation
    await fetch("/api/logout", {
      method: "POST",
    });

    // Optional: redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-neutral-800">
        Record Blood Pressure
      </h1>

      {/* Navigation Bar for User Selection */}
      <nav className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center bg-gray-50 p-3 rounded-md">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mb-4 sm:mb-0">
          <button
            onClick={() => setSelectedPerson("1")}
            className={`px-4 py-2 rounded-md font-medium w-full ${
              selectedPerson === "1"
                ? "bg-neutral-700 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Abu Hanifah
          </button>
          <button
            onClick={() => setSelectedPerson("2")}
            className={`px-4 py-2 rounded-md font-medium w-full ${
              selectedPerson === "2"
                ? "bg-neutral-700 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Mazliah Othman
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-4 py-2 rounded-md bg-zinc-600 text-white font-semibold hover:bg-zinc-500 transition"
        >
          Logout
        </button>
      </nav>

      {message && (
        <div
          className={`mb-4 text-center text-sm font-medium px-4 py-2 rounded-md ${
            isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="systolic" className="block text-sm font-medium text-gray-700">
            Systolic
          </label>
          <input
            type="number"
            name="systolic"
            id="systolic"
            value={form.systolic}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="e.g. 120"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="diastolic" className="block text-sm font-medium text-neutral-700">
            Diastolic
          </label>
          <input
            type="number"
            name="diastolic"
            id="diastolic"
            value={form.diastolic}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="e.g. 80"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="pulse" className="block text-sm font-medium text-gray-700">
            Pulse
          </label>
          <input
            type="number"
            name="pulse"
            id="pulse"
            value={form.pulse}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="e.g. 72"
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className="mt-2 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="Any comments or symptoms..."
          />
        </div>

        {/* This select is now essentially managed by the navigation buttons */}
        {/* We keep it in the form state for submission, but its visual component is gone */}
        <div className="sm:col-span-6 hidden">
          <label htmlFor="person" className="block text-sm font-medium text-gray-700">
            Selected Person (Hidden)
          </label>
          <input
            type="hidden" // Hidden input for the form submission
            name="person"
            id="person"
            value={selectedPerson} // Always use selectedPerson for form submission
            readOnly // Make it read-only as it's controlled by the nav
          />
        </div>

        <div className="sm:col-span-6">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-md bg-neutral-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-neutral-500 transition"
          >
            💾 Save Record
          </button>
        </div>
      </form>

      {records.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Records for{" "}
              {selectedPerson === "1" ? "Abu Hanifah" : "Mazliah Othman"}
            </h2>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition"
            >
              ⬇️ Export to Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-md shadow-sm">
              <thead className="bg-gray-100 text-gray-700 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Systolic</th>
                  <th className="px-4 py-2 border-b">Diastolic</th>
                  <th className="px-4 py-2 border-b">Pulse</th>
                  <th className="px-4 py-2 border-b">Notes</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="text-sm text-gray-800">
                    <td className="px-4 py-2 border-b">
                      {convertToGmt8(record.recordedAt)}
                    </td>
                    <td className="px-4 py-2 border-b">{record.systolic}</td>
                    <td className="px-4 py-2 border-b">{record.diastolic}</td>
                    <td className="px-4 py-2 border-b">
                      {record.pulse ?? "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.notes || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}