import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { Theme } from "@/models/Theme";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "ID de thématique invalide" }, { status: 400 });
    }

    const body = await req.json();
    const { name, slug, iconUrl, isActive } = body;

    // Préparer les données à mettre à jour
    const updateData: { name?: string; slug?: string; iconUrl?: string; isActive?: boolean } = {};
    
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    
    if (slug !== undefined) {
      if (!slug.trim()) {
        return NextResponse.json({ error: "Le slug ne peut pas être vide" }, { status: 400 });
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.json({ error: "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets" }, { status: 400 });
      }
      
      // Vérifier si le slug existe déjà (sauf pour la thématique actuelle)
      const existingTheme = await Theme.findOne({ slug: slug, _id: { $ne: id } });
      if (existingTheme) {
        return NextResponse.json({ error: "Une thématique avec ce slug existe déjà" }, { status: 400 });
      }
      
      updateData.slug = slug.trim();
    }
    
    if (iconUrl !== undefined) {
      // Valider l'URL de l'icône (optionnel, mais si fournie, elle doit être une URL valide)
      if (iconUrl !== null && iconUrl.trim() === "") {
        return NextResponse.json({ error: "L'URL de l'icône ne peut pas être vide" }, { status: 400 });
      }

      if (iconUrl && !iconUrl.startsWith('http') && !iconUrl.startsWith('/')) {
        return NextResponse.json({ error: "L'URL de l'icône doit commencer par http ou /" }, { status: 400 });
      }
      
      updateData.iconUrl = iconUrl || null;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedTheme = await Theme.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTheme) {
      return NextResponse.json({ error: "Thématique introuvable" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Thématique mise à jour avec succès",
      theme: {
        _id: updatedTheme?._id,
        name: updatedTheme?.name,
        slug: updatedTheme?.slug,
        iconUrl: updatedTheme?.iconUrl,
        isActive: updatedTheme?.isActive,
        createdAt: updatedTheme?.createdAt,
        updatedAt: updatedTheme?.updatedAt
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la thématique:", error);
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "ID de thématique invalide" }, { status: 400 });
    }

    const deletedTheme = await Theme.findByIdAndDelete(id);

    if (!deletedTheme) {
      return NextResponse.json({ error: "Thématique introuvable" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Thématique supprimée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la thématique:", error);
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}