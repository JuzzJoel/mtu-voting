"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input } from "@/components/ui";

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

  const [nomineeName, setNomineeName] = useState("");
  const [nomineeCategoryId, setNomineeCategoryId] = useState("");
  const [nomineeDescription, setNomineeDescription] = useState("");
  const [nomineeFile, setNomineeFile] = useState<File | null>(null);
  const [nomineePreview, setNomineePreview] = useState<string | null>(null);
  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchJson<{ categories: Category[] }>("/api/admin/categories")
  });

  const { data: nomineesData, isLoading: nomineesLoading } = useQuery({
    queryKey: ["admin-nominees"],
    queryFn: () => fetchJson<{ nominees: Nominee[] }>("/api/admin/nominees")
  });

  const categories = categoriesData?.categories ?? [];
  const nominees = nomineesData?.nominees ?? [];

  const resetNomineeForm = () => {
    setNomineeName("");
    setNomineeCategoryId("");
    setNomineeDescription("");
    setNomineeFile(null);
    setNomineePreview(null);
    setEditingNomineeId(null);
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
        body: JSON.stringify({ title: categoryTitle.trim(), order: categoryOrder, isActive: categoryActive })
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setCategoryTitle("");
      setCategoryOrder(0);
      setCategoryActive(true);
      showToast("Category created successfully.", "success");
    },
    onError: () => showToast("Could not create category.", "error")
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      showToast("Category deleted.", "success");
    },
    onError: () => showToast("Could not delete category.", "error")
  });

  const uploadNomineeImage = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });
      if (!res.ok) throw new Error("Upload initialization failed");
      const data = (await res.json()) as { uploadUrl: string; publicUrl: string };
      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      return data.publicUrl;
    },
    onError: () => showToast("Image upload failed.", "error"),
    onSettled: () => setUploading(false)
  });

  const createNominee = useMutation({
    mutationFn: async () => {
      const fileUrl = nomineeFile ? await uploadNomineeImage.mutateAsync(nomineeFile) : nomineePreview;
      if (!fileUrl) throw new Error("Missing image");

      const payload = {
        name: nomineeName.trim(),
        categoryId: nomineeCategoryId,
        imageUrl: fileUrl,
        description: nomineeDescription.trim() ? nomineeDescription.trim() : null
      };

      const res = await fetch("/api/admin/nominees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create nominee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nominees"] });
      resetNomineeForm();
      showToast("Nominee added.", "success");
    },
    onError: () => showToast("Could not add nominee.", "error")
  });

  const updateNominee = useMutation({
    mutationFn: async (nomineeId: string) => {
      const fileUrl = nomineeFile ? await uploadNomineeImage.mutateAsync(nomineeFile) : nomineePreview;
      if (!fileUrl) throw new Error("Missing image");

      const payload = {
        name: nomineeName.trim(),
        categoryId: nomineeCategoryId,
        imageUrl: fileUrl,
        description: nomineeDescription.trim() ? nomineeDescription.trim() : null
      };

      const res = await fetch(`/api/admin/nominees/${nomineeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update nominee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nominees"] });
      resetNomineeForm();
      showToast("Nominee updated.", "success");
    },
    onError: () => showToast("Could not update nominee.", "error")
  });

  const deleteNominee = useMutation({
    mutationFn: async (nomineeId: string) => {
      const res = await fetch(`/api/admin/nominees/${nomineeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete nominee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nominees"] });
      showToast("Nominee deleted.", "success");
    },
    onError: () => showToast("Could not delete nominee.", "error")
  });

  const isNomineeFormValid = useMemo(() => {
    return nomineeName.trim().length > 1 && nomineeCategoryId && (nomineeFile || nomineePreview);
  }, [nomineeName, nomineeCategoryId, nomineeFile, nomineePreview]);

  return (
    <div className="space-y-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-lg px-4 py-3 text-body-sm shadow-card ${toast.type === "success" ? "bg-primary-green/20 text-primary-green" : "bg-accent-red/20 text-accent-red"}`}>
          {toast.message}
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-white">Nominee Management</h1>
          <p className="text-body-lg text-neutral-text-secondary">Manage categories, nominees, and images in one place.</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card variant="glass" className="p-6">
          <h2 className="text-h2 text-white mb-4">Create Category</h2>
          <div className="space-y-4">
            <Input
              label="Category name"
              value={categoryTitle}
              onChange={(event) => setCategoryTitle(event.target.value)}
              placeholder="e.g. Most Fashionable (Male)"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Order"
                type="number"
                value={String(categoryOrder)}
                onChange={(event) => setCategoryOrder(Number(event.target.value))}
              />
              <label className="block text-body-sm font-semibold text-neutral-text-primary">
                <span className="mb-2 block">Active</span>
                <input
                  type="checkbox"
                  checked={categoryActive}
                  onChange={(event) => setCategoryActive(event.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
            <Button
              size="lg"
              onClick={() => createCategory.mutate()}
              disabled={!categoryTitle.trim() || createCategory.isPending}
              isLoading={createCategory.isPending}
            >
              Add Category
            </Button>
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h2 className="text-h2 text-white mb-4">Category List</h2>
          {categoriesLoading ? (
            <p className="text-body-sm text-neutral-text-secondary">Loading categories...</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
                  <div>
                    <p className="text-body-md text-white font-semibold">{category.title}</p>
                    <p className="text-body-sm text-neutral-text-secondary">Order {category.order}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => deleteCategory.mutate(category.id)}
                    disabled={deleteCategory.isPending}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-body-sm text-neutral-text-secondary">No categories yet.</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card variant="glass" className="p-6">
          <h2 className="text-h2 text-white mb-4">Nominee Form</h2>
          <div className="space-y-4">
            <Input
              label="Nominee name"
              value={nomineeName}
              onChange={(event) => setNomineeName(event.target.value)}
              placeholder="e.g. John Doe"
            />
            <label className="block text-body-sm font-semibold text-neutral-text-primary">
              <span className="mb-2 block">Category</span>
              <select
                className="w-full rounded-md border border-neutral-border bg-neutral-surface-dark/50 px-4 py-3 text-neutral-text-primary"
                value={nomineeCategoryId}
                onChange={(event) => setNomineeCategoryId(event.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-body-sm font-semibold text-neutral-text-primary">
              <span className="mb-2 block">Description (optional)</span>
              <textarea
                className="w-full rounded-md border border-neutral-border bg-neutral-surface-dark/50 px-4 py-3 text-neutral-text-primary"
                rows={3}
                value={nomineeDescription}
                onChange={(event) => setNomineeDescription(event.target.value)}
              />
            </label>
            <label className="block text-body-sm font-semibold text-neutral-text-primary">
              <span className="mb-2 block">Image upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setNomineeFile(file);
                  setNomineePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </label>
            {nomineePreview && (
              <div className="rounded-lg overflow-hidden border border-white/10">
                <Image
                  src={nomineePreview}
                  alt="Preview"
                  width={420}
                  height={240}
                  className="w-full object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1"
                disabled={!isNomineeFormValid || uploading || createNominee.isPending || updateNominee.isPending}
                isLoading={uploading || createNominee.isPending || updateNominee.isPending}
                onClick={() => {
                  if (editingNomineeId) {
                    updateNominee.mutate(editingNomineeId);
                  } else {
                    createNominee.mutate();
                  }
                }}
              >
                {editingNomineeId ? "Update Nominee" : "Add Nominee"}
              </Button>
              {editingNomineeId && (
                <Button variant="secondary" size="lg" onClick={resetNomineeForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h2 className="text-h2 text-white mb-4">Nominees</h2>
          {nomineesLoading ? (
            <p className="text-body-sm text-neutral-text-secondary">Loading nominees...</p>
          ) : (
            <div className="space-y-3">
              {nominees.map((nominee) => (
                <div key={nominee.id} className="rounded-lg border border-white/10 p-4 flex gap-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-neutral-card-dark">
                    <Image src={nominee.imageUrl} alt={nominee.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-md text-white font-semibold">{nominee.name}</p>
                    <p className="text-body-sm text-neutral-text-secondary">{nominee.category.title}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingNomineeId(nominee.id);
                        setNomineeName(nominee.name);
                        setNomineeCategoryId(nominee.category.id);
                        setNomineeDescription(nominee.description ?? "");
                        setNomineePreview(nominee.imageUrl);
                        setNomineeFile(null);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteNominee.mutate(nominee.id)}
                      disabled={deleteNominee.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {nominees.length === 0 && (
                <p className="text-body-sm text-neutral-text-secondary">No nominees added yet.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
