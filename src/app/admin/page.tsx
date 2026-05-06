"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";

type Category = {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
};

type Nominee = {
  id: string;
  name: string;
  imageUrl: string;
  description?: string | null;
  category: { id: string; title: string };
};

type ToastState = { message: string; type: "success" | "error" } | null;

async function fetchJson<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed");
  return (await res.json()) as T;
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<ToastState>(null);

  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryOrder, setCategoryOrder] = useState(0);
  const [categoryActive, setCategoryActive] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [nomineeName, setNomineeName] = useState("");
  const [nomineeCategoryId, setNomineeCategoryId] = useState("");
  const [nomineeDescription, setNomineeDescription] = useState("");
  const [nomineeFile, setNomineeFile] = useState<File | null>(null);
  const [nomineePreview, setNomineePreview] = useState<string | null>(null);
  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchJson<{ categories: Category[] }>("/api/admin/categories"),
  });

  const { data: nomineesData, isLoading: nomineesLoading } = useQuery({
    queryKey: ["admin-nominees"],
    queryFn: () => fetchJson<{ nominees: Nominee[] }>("/api/admin/nominees"),
  });

  const categories = categoriesData?.categories ?? [];
  const nominees = nomineesData?.nominees ?? [];

  const resetNomineeForm = () => {
    setNomineeName(""); setNomineeCategoryId(""); setNomineeDescription("");
    setNomineeFile(null); setNomineePreview(null); setEditingNomineeId(null);
  };

  const resetCategoryForm = () => {
    setCategoryTitle(""); setCategoryOrder(0); setCategoryActive(true); setEditingCategoryId(null);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const createCategory = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: categoryTitle.trim(), order: categoryOrder, isActive: categoryActive }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); setCategoryTitle(""); setCategoryOrder(0); setCategoryActive(true); showToast("Category created.", "success"); },
    onError: () => showToast("Could not create category.", "error"),
  });

  const updateCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: categoryTitle.trim(), order: categoryOrder, isActive: categoryActive }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); resetCategoryForm(); showToast("Category updated.", "success"); },
    onError: () => showToast("Could not update category.", "error"),
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); showToast("Category deleted.", "success"); },
    onError: () => showToast("Could not delete category.", "error"),
  });

  const uploadNomineeImage = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!res.ok) throw new Error("Upload initialization failed");
      const data = (await res.json()) as { uploadUrl: string; publicUrl: string };
      const uploadRes = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("Upload failed");
      return data.publicUrl;
    },
    onError: () => showToast("Image upload failed.", "error"),
    onSettled: () => setUploading(false),
  });

  const createNominee = useMutation({
    mutationFn: async () => {
      const fileUrl = nomineeFile ? await uploadNomineeImage.mutateAsync(nomineeFile) : nomineePreview;
      if (!fileUrl) throw new Error("Missing image");
      const res = await fetch("/api/admin/nominees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nomineeName.trim(), categoryId: nomineeCategoryId, imageUrl: fileUrl, description: nomineeDescription.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed to create nominee");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-nominees"] }); resetNomineeForm(); showToast("Nominee added.", "success"); },
    onError: () => showToast("Could not add nominee.", "error"),
  });

  const updateNominee = useMutation({
    mutationFn: async (nomineeId: string) => {
      const fileUrl = nomineeFile ? await uploadNomineeImage.mutateAsync(nomineeFile) : nomineePreview;
      if (!fileUrl) throw new Error("Missing image");
      const res = await fetch(`/api/admin/nominees/${nomineeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nomineeName.trim(), categoryId: nomineeCategoryId, imageUrl: fileUrl, description: nomineeDescription.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed to update nominee");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-nominees"] }); resetNomineeForm(); showToast("Nominee updated.", "success"); },
    onError: () => showToast("Could not update nominee.", "error"),
  });

  const deleteNominee = useMutation({
    mutationFn: async (nomineeId: string) => {
      const res = await fetch(`/api/admin/nominees/${nomineeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete nominee");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-nominees"] }); showToast("Nominee deleted.", "success"); },
    onError: () => showToast("Could not delete nominee.", "error"),
  });

  const isNomineeFormValid = useMemo(() =>
    nomineeName.trim().length > 1 && nomineeCategoryId && (nomineeFile || nomineePreview),
    [nomineeName, nomineeCategoryId, nomineeFile, nomineePreview]
  );

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 text-xs font-semibold border ${
          toast.type === "success"
            ? "bg-white border-green-300 text-green-700"
            : "bg-white border-red-300 text-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-black">Nominee Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage categories, nominees, and images.</p>
      </div>

      {/* Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-black mb-4">
            {editingCategoryId ? "Edit Category" : "Create Category"}
          </h2>
          <div className="space-y-3">
            <Input
              label="Category name"
              value={categoryTitle}
              onChange={(e) => setCategoryTitle(e.target.value)}
              placeholder="e.g. Most Fashionable (Male)"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Order"
                type="number"
                value={String(categoryOrder)}
                onChange={(e) => setCategoryOrder(Number(e.target.value))}
              />
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Active</span>
                <input
                  type="checkbox"
                  checked={categoryActive}
                  onChange={(e) => setCategoryActive(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="md"
                onClick={() => editingCategoryId ? updateCategory.mutate(editingCategoryId) : createCategory.mutate()}
                disabled={!categoryTitle.trim() || createCategory.isPending || updateCategory.isPending}
                isLoading={createCategory.isPending || updateCategory.isPending}
              >
                {editingCategoryId ? "Save" : "Add Category"}
              </Button>
              {editingCategoryId && (
                <Button variant="secondary" size="md" onClick={resetCategoryForm}>Cancel</Button>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-black mb-4">Categories</h2>
          {categoriesLoading ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-black">{category.title}</p>
                    <p className="text-xs text-gray-400">Order {category.order} · {category.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => { setEditingCategoryId(category.id); setCategoryTitle(category.title); setCategoryOrder(category.order); setCategoryActive(category.isActive); }}>
                      Edit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => deleteCategory.mutate(category.id)} disabled={deleteCategory.isPending}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-xs text-gray-400 py-3">No categories yet.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Nominees */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-black mb-4">
            {editingNomineeId ? "Edit Nominee" : "Add Nominee"}
          </h2>
          <div className="space-y-3">
            <Input
              label="Nominee name"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              placeholder="e.g. John Doe"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-black"
                value={nomineeCategoryId}
                onChange={(e) => setNomineeCategoryId(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Description (optional)</label>
              <textarea
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-black"
                rows={3}
                value={nomineeDescription}
                onChange={(e) => setNomineeDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Image</label>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-gray-600"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setNomineeFile(file);
                  setNomineePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </div>
            {nomineePreview && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Preview ready</span>
                  <button className="text-red-500 hover:text-red-700" onClick={() => { setNomineeFile(null); setNomineePreview(null); }}>Clear</button>
                </div>
                <div className="overflow-hidden border border-gray-200">
                  <Image src={nomineePreview} alt="Preview" width={400} height={220} className="w-full object-cover" unoptimized />
                </div>
              </>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                size="md"
                className="flex-1"
                disabled={!isNomineeFormValid || uploading || createNominee.isPending || updateNominee.isPending}
                isLoading={uploading || createNominee.isPending || updateNominee.isPending}
                onClick={() => editingNomineeId ? updateNominee.mutate(editingNomineeId) : createNominee.mutate()}
              >
                {editingNomineeId ? "Update" : "Add Nominee"}
              </Button>
              {editingNomineeId && (
                <Button variant="secondary" size="md" onClick={resetNomineeForm}>Cancel</Button>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-black mb-4">Nominees ({nominees.length})</h2>
          {nomineesLoading ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {nominees.map((nominee) => (
                <div key={nominee.id} className="flex gap-3 py-3">
                  <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-gray-100">
                    <Image src={nominee.imageUrl} alt={nominee.name} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{nominee.name}</p>
                    <p className="text-xs text-gray-400 truncate">{nominee.category.title}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setEditingNomineeId(nominee.id); setNomineeName(nominee.name);
                      setNomineeCategoryId(nominee.category.id); setNomineeDescription(nominee.description ?? "");
                      setNomineePreview(nominee.imageUrl); setNomineeFile(null);
                    }}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => deleteNominee.mutate(nominee.id)} disabled={deleteNominee.isPending}>Delete</Button>
                  </div>
                </div>
              ))}
              {nominees.length === 0 && <p className="text-xs text-gray-400 py-3">No nominees yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
