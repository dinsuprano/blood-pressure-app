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
};

export default function Home() {
  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Record saved successfully!");
      setIsError(false);
      setForm({ systolic: "", diastolic: "", pulse: "", notes: "" });
    } else {
      setMessage(`❌ Error: ${data.error}`);
      setIsError(true);
    }
  };

  const fetchRecords = async () => {
    const res = await fetch("/api/records");
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
      fetchRecords();
    } else {
      const data = await res.json();
      setMessage(`❌ Delete failed: ${data.error}`);
      setIsError(true);
    }
  };

  const convertToGmt8 = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur" });
  };

  const handleExport = () => {
    const exportData = records.map((record) => ({
      ID: record.id,
      Systolic: record.systolic,
      Diastolic: record.diastolic,
      Pulse: record.pulse ?? "",
      Notes: record.notes ?? "",
      "Recorded At": convertToGmt8(record.recordedAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    XLSX.writeFile(workbook, "blood_pressure_records.xlsx");
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (message && !isError) fetchRecords();
  }, [message]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Blood Pressure Entry
      </h1>

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
          <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700">
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
            Pulse (Optional)
          </label>
          <input
            type="number"
            name="pulse"
            id="pulse"
            value={form.pulse}
            onChange={handleChange}
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

        <div className="sm:col-span-6">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-indigo-500 transition"
          >
            💾 Save Record
          </button>
        </div>
      </form>

      {records.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Saved Records</h2>
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
                    <td className="px-4 py-2 border-b">{record.pulse ?? "-"}</td>
                    <td className="px-4 py-2 border-b">{record.notes || "-"}</td>
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
