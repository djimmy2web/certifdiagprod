"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

interface Theme {
  _id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminThemesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [editIconUrl, setEditIconUrl] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTheme, setNewTheme] = useState({ name: "", slug: "", iconUrl: "" });
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", slug: "" });
  const [tempIconUrl, setTempIconUrl] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") {
      router.replace("/connexion");
      return;
    }
    fetchThemes();
  }, [status, session, router]);

  const fetchThemes = async () => {
      try {
        const res = await fetch("/api/admin/themes");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Erreur");
      setThemes(data.themes || []);
      } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
  };

  const handleEditIcon = (theme: Theme) => {
    setEditingTheme(theme);
    setEditIconUrl(theme.iconUrl || "");
    setTempIconUrl(theme.iconUrl || "");
  };

  const handleSaveIcon = async () => {
    if (!editingTheme) return;
    
    try {
      const res = await fetch(`/api/admin/themes/${editingTheme._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iconUrl: tempIconUrl }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      
      // Mettre à jour la liste des thématiques
      setThemes(prev => prev.map(theme => 
        theme._id === editingTheme._id 
          ? { ...theme, iconUrl: tempIconUrl }
          : theme
      ));
      
      setEditingTheme(null);
      setEditIconUrl("");
      setTempIconUrl("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    }
  };


  const handleCreateTheme = async () => {
    if (!newTheme.name.trim() || !newTheme.slug.trim()) {
      setError("Le nom et le slug sont obligatoires");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTheme.name.trim(),
          slug: newTheme.slug.trim().toLowerCase(),
          iconUrl: newTheme.iconUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");

      // Ajouter la nouvelle thématique à la liste
      setThemes(prev => [...prev, data.theme]);
      setNewTheme({ name: "", slug: "", iconUrl: "" });
      setShowCreateForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette thématique ?")) return;

    try {
      const res = await fetch(`/api/admin/themes/${themeId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");

      // Supprimer la thématique de la liste
      setThemes(prev => prev.filter(theme => theme._id !== themeId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la suppression");
    }
  };

  const handleToggleActive = async (theme: Theme) => {
    try {
      const res = await fetch(`/api/admin/themes/${theme._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !theme.isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");

      // Mettre à jour la thématique dans la liste
      setThemes(prev => prev.map(t => 
        t._id === theme._id ? { ...t, isActive: !theme.isActive } : t
      ));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la mise à jour");
    }
  };

  const handleStartEdit = (theme: Theme, field: 'name' | 'slug') => {
    setEditingField(`${theme._id}-${field}`);
    setEditValues({ name: theme.name, slug: theme.slug });
  };

  const handleSaveField = async (theme: Theme, field: 'name' | 'slug') => {
    const value = editValues[field].trim();
    if (!value) {
      setError(`Le ${field === 'name' ? 'nom' : 'slug'} ne peut pas être vide`);
      return;
    }

    if (field === 'slug' && !/^[a-z0-9-]+$/.test(value)) {
      setError("Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets");
      return;
    }

    try {
      const res = await fetch(`/api/admin/themes/${theme._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");

      // Mettre à jour la thématique dans la liste
      setThemes(prev => prev.map(t => 
        t._id === theme._id ? { ...t, [field]: value } : t
      ));

      setEditingField(null);
      setEditValues({ name: "", slug: "" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la mise à jour");
    }
  };

  const handleCancelEdit = () => {
    setEditingTheme(null);
    setEditIconUrl("");
    setTempIconUrl("");
    setEditingField(null);
    setEditValues({ name: "", slug: "" });
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestion des Thématiques</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700"
        >
          + Nouvelle thématique
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Créer une nouvelle thématique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la thématique
              </label>
              <input
                type="text"
                value={newTheme.name}
                onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: Électricité"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                value={newTheme.slug}
                onChange={(e) => setNewTheme(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: electricite"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                currentImageUrl={newTheme.iconUrl}
                onImageUpload={(url) => setNewTheme(prev => ({ ...prev, iconUrl: url }))}
                onImageRemove={() => setNewTheme(prev => ({ ...prev, iconUrl: "" }))}
                label="Icône de la thématique (optionnel)"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreateTheme}
              disabled={saving}
              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Création..." : "Créer la thématique"}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTheme({ name: "", slug: "", iconUrl: "" });
              }}
              className="inline-flex items-center rounded-lg bg-gray-600 text-white px-4 py-2 text-sm shadow hover:bg-gray-700"
            >
              Annuler
            </button>
        </div>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icône
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {themes.map((theme) => (
                <tr key={theme._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingTheme?._id === theme._id ? (
                      <div className="w-20">
                        <ImageUpload
                          currentImageUrl={tempIconUrl}
                          onImageUpload={setTempIconUrl}
                          onImageRemove={() => setTempIconUrl("")}
                          label=""
                          className="w-20"
                        />
                        {tempIconUrl !== editIconUrl && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={handleSaveIcon}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={() => setTempIconUrl(editIconUrl)}
                              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center overflow-hidden">
                        {theme.iconUrl ? (
                          <img
                            src={theme.iconUrl}
                            alt={theme.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">?</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingField === `${theme._id}-name` ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveField(theme, 'name')}
                          className="text-sm text-green-600 hover:text-green-900"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{theme.name}</div>
                        <button
                          onClick={() => handleStartEdit(theme, 'name')}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {editingField === `${theme._id}-slug` ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValues.slug}
                          onChange={(e) => setEditValues(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full border rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveField(theme, 'slug')}
                          className="text-sm text-green-600 hover:text-green-900"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          ✕
                        </button>
                </div>
                    ) : (
                <div className="flex items-center gap-2">
                        <span>{theme.slug}</span>
                        <button
                          onClick={() => handleStartEdit(theme, 'slug')}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      theme.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {theme.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingTheme?._id === theme._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Fermer
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditIcon(theme)}
                          className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Modifier l&apos;icône
                        </button>
                        <button
                          onClick={() => handleToggleActive(theme)}
                          className={`text-sm font-medium ${
                            theme.isActive 
                              ? "text-orange-600 hover:text-orange-900" 
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {theme.isActive ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => handleDeleteTheme(theme._id)}
                          className="text-sm text-red-600 hover:text-red-900 font-medium"
                        >
                          Supprimer
                        </button>
                </div>
                    )}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Conseils pour les icônes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Utilisez des emojis simples et reconnaissables</li>
          <li>• Exemples : ⚡ (électricité), 🏠 (DPE), 🐛 (termites), Pb (plomb)</li>
          <li>• Évitez les emojis trop complexes ou colorés</li>
          <li>• Testez l&apos;affichage sur différents appareils</li>
        </ul>
      </div>
    </div>
  );
}