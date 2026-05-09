"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";

type Category = { id: string; title: string; order: number; isActive: boolean };
type Nominee = { id: string; name: string; imageUrl: string; description?: string | null; position?: number | null; category: { id: string; title: string } };
type Toast = { message: string; type: "success" | "error" } | null;

async function fetchJson<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed");
  return (await res.json()) as T;
}

export default function AdminPage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<Toast>(null);

  // Category form
  const [catTitle, setCatTitle] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [catActive, setCatActive] = useState(true);
  const [editCatId, setEditCatId] = useState<string | null>(null);

  // Nominee form
  const [nomName, setNomName] = useState("");
  const [nomCatId, setNomCatId] = useState("");
  const [nomDesc, setNomDesc] = useState("");
  const [nomPosition, setNomPosition] = useState<string>("");
  const [nomFile, setNomFile] = useState<File | null>(null);
  const [nomPreview, setNomPreview] = useState<string | null>(null);
  const [editNomId, setEditNomId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchJson<{ categories: Category[] }>("/api/admin/categories"),
  });
  const { data: nomData, isLoading: nomLoading } = useQuery({
    queryKey: ["admin-nominees"],
    queryFn: () => fetchJson<{ nominees: Nominee[] }>("/api/admin/nominees"),
  });

  const categories = catData?.categories ?? [];
  const nominees = nomData?.nominees ?? [];

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const resetCatForm = () => { setCatTitle(""); setCatOrder(0); setCatActive(true); setEditCatId(null); };
  const resetNomForm = () => { setNomName(""); setNomCatId(""); setNomDesc(""); setNomPosition(""); setNomFile(null); setNomPreview(null); setEditNomId(null); };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-url", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = (await res.json()) as { url: string };
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const createCat = useMutation({
    mutationFn: () => fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: catTitle.trim(), order: catOrder, isActive: catActive }) }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); setCatTitle(""); setCatOrder(0); setCatActive(true); showToast("Category created.", "success"); },
    onError: () => showToast("Failed to create category.", "error"),
  });

  const updateCat = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: catTitle.trim(), order: catOrder, isActive: catActive }) }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); resetCatForm(); showToast("Category updated.", "success"); },
    onError: () => showToast("Failed to update category.", "error"),
  });

  const deleteCat = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/categories/${id}`, { method: "DELETE" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); showToast("Category deleted.", "success"); },
    onError: () => showToast("Failed to delete category.", "error"),
  });

  type NomPayload = { name: string; categoryId: string; description: string | null; position: number | null; file: File | null; preview: string | null };

  const createNom = useMutation({
    mutationFn: async (payload: NomPayload) => {
      const imageUrl = payload.file ? await uploadImage(payload.file) : (payload.preview ?? null);
      const res = await fetch("/api/admin/nominees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: payload.name, categoryId: payload.categoryId, imageUrl, description: payload.description, position: payload.position }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Failed to add nominee.");
      }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-nominees"] }); resetNomForm(); showToast("Nominee added.", "success"); },
    onError: () => showToast("Failed to add nominee.", "error"),
  });

  const updateNom = useMutation({
    mutationFn: async (payload: NomPayload & { id: string }) => {
      const imageUrl = payload.file ? await uploadImage(payload.file) : payload.preview;
      if (!imageUrl) throw new Error("No image");
      const res = await fetch(`/api/admin/nominees/${payload.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: payload.name, categoryId: payload.categoryId, imageUrl, description: payload.description, position: payload.position }) });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-nominees"] }); resetNomForm(); showToast("Nominee updated.", "success"); },
    onError: () => showToast("Failed to update nominee.", "error"),
  });

  const deleteNom = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/nominees/${id}`, { method: "DELETE" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-nominees"] }); showToast("Nominee deleted.", "success"); },
    onError: () => showToast("Failed to delete nominee.", "error"),
  });

  const nomFormValid = useMemo(() => nomName.trim().length > 1 && nomCatId, [nomName, nomCatId]);
  const isBusy = uploading || createNom.isPending || updateNom.isPending;

  const field = "w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all";

  return (
    <div className="space-y-8 px-5 py-8 max-w-5xl mx-auto lg:px-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 text-sm font-medium shadow-lg border-l-4 bg-white ${toast.type === "success" ? "border-green-500 text-green-700" : "border-red-500 text-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Page header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-xl font-bold text-white">Nominee Management</h1>
        <p className="text-sm text-gray-500 mt-1">Add and manage award categories and nominees.</p>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Category form */}
          <div className="bg-white border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{editCatId ? "Edit Category" : "Add Category"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                <input className={field} placeholder="e.g. Most Fashionable (M/F)" value={catTitle} onChange={e => setCatTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Order</label>
                  <input className={field} type="number" value={String(catOrder)} onChange={e => setCatOrder(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Active</label>
                  <div className="flex items-center h-10">
                    <input type="checkbox" checked={catActive} onChange={e => setCatActive(e.target.checked)} className="w-4 h-4 accent-black" />
                    <span className="ml-2 text-sm text-gray-600">{catActive ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="md" onClick={() => editCatId ? updateCat.mutate(editCatId) : createCat.mutate()} disabled={!catTitle.trim() || createCat.isPending || updateCat.isPending} isLoading={createCat.isPending || updateCat.isPending}>
                  {editCatId ? "Save Changes" : "Add Category"}
                </Button>
                {editCatId && <Button variant="secondary" size="md" onClick={resetCatForm}>Cancel</Button>}
              </div>
            </div>
          </div>

          {/* Category list */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">All Categories</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5">{categories.length}</span>
            </div>
            {catLoading ? (
              <p className="text-xs text-gray-400 py-4">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No categories yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{cat.title}</p>
                      <p className="text-xs text-gray-400">#{cat.order} · {cat.isActive ? <span className="text-green-600">Active</span> : <span className="text-gray-400">Inactive</span>}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="text-xs text-gray-500 hover:text-black px-2 py-1 border border-gray-200 hover:border-gray-400 transition-colors" onClick={() => { setEditCatId(cat.id); setCatTitle(cat.title); setCatOrder(cat.order); setCatActive(cat.isActive); }}>Edit</button>
                      <button className="text-xs text-red-400 hover:text-red-600 px-2 py-1 border border-red-100 hover:border-red-300 transition-colors" onClick={() => deleteCat.mutate(cat.id)} disabled={deleteCat.isPending}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nominees */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Nominees</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Nominee form */}
          <div className="bg-white border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{editNomId ? "Edit Nominee" : "Add Nominee"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                <input className={field} placeholder="e.g. John Doe" value={nomName} onChange={e => setNomName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                <select className={field} value={nomCatId} onChange={e => setNomCatId(e.target.value)}>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
                <textarea className={field} rows={2} value={nomDesc} onChange={e => setNomDesc(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Card Position <span className="text-gray-400">(optional — lower number appears first)</span></label>
                <input
                  className={field}
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={nomPosition}
                  onChange={e => setNomPosition(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Photo <span className="text-gray-400">(optional)</span></label>
                <input type="file" accept="image/*" className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-200 file:text-xs file:font-medium file:text-gray-700 file:bg-gray-50 hover:file:bg-gray-100 file:cursor-pointer"
                  onChange={e => { const f = e.target.files?.[0] ?? null; setNomFile(f); setNomPreview(f ? URL.createObjectURL(f) : null); }} />
              </div>
              {nomPreview && (
                <div className="relative">
                  <div className="aspect-[4/5] w-28 overflow-hidden border border-gray-200 bg-gray-100">
                    <Image src={nomPreview} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                  <button className="absolute top-1 left-1 bg-white border border-gray-200 text-xs text-red-500 px-1.5 py-0.5 hover:text-red-700 transition-colors" onClick={() => { setNomFile(null); setNomPreview(null); }}>✕</button>
                </div>
              )}
              {(createNom.isError || updateNom.isError) ? (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 px-3 py-2">
                  {(createNom.error instanceof Error ? createNom.error.message : null) ??
                   (updateNom.error instanceof Error ? updateNom.error.message : null) ??
                   "Failed to save nominee. Please try again."}
                </p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <Button size="md" className="flex-1" disabled={!nomFormValid || isBusy} isLoading={isBusy} onClick={() => {
                  const payload = {
                    name: nomName.trim(),
                    categoryId: nomCatId,
                    description: nomDesc.trim() || null,
                    position: nomPosition !== "" ? parseInt(nomPosition, 10) : null,
                    file: nomFile,
                    preview: nomPreview,
                  };
                  if (editNomId) updateNom.mutate({ ...payload, id: editNomId });
                  else createNom.mutate(payload);
                }}>
                  {editNomId ? "Save Changes" : "Add Nominee"}
                </Button>
                {editNomId && <Button variant="secondary" size="md" onClick={resetNomForm}>Cancel</Button>}
              </div>
            </div>
          </div>

          {/* Nominee list */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">All Nominees</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5">{nominees.length}</span>
            </div>
            {nomLoading ? (
              <p className="text-xs text-gray-400 py-4">Loading...</p>
            ) : nominees.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No nominees yet. Add your first nominee.</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
                {nominees.map(nom => (
                  <div key={nom.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 flex-shrink-0 overflow-hidden bg-gray-100 border border-gray-200">
                      <Image src={nom.imageUrl} alt={nom.name} width={36} height={36} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{nom.name}</p>
                      <p className="text-xs text-gray-400 truncate">{nom.category.title}{nom.position != null ? ` · #${nom.position}` : ""}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="text-xs text-gray-500 hover:text-black px-2 py-1 border border-gray-200 hover:border-gray-400 transition-colors"
                        onClick={() => { setEditNomId(nom.id); setNomName(nom.name); setNomCatId(nom.category.id); setNomDesc(nom.description ?? ""); setNomPosition(nom.position != null ? String(nom.position) : ""); setNomPreview(nom.imageUrl); setNomFile(null); }}>Edit</button>
                      <button className="text-xs text-red-400 hover:text-red-600 px-2 py-1 border border-red-100 hover:border-red-300 transition-colors" onClick={() => deleteNom.mutate(nom.id)} disabled={deleteNom.isPending}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
