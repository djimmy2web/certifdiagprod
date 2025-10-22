"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MediaUpload from "@/components/MediaUpload";
import ImageUpload from "@/components/ImageUpload";

type Choice = { 
  text: string; 
  isCorrect: boolean; 
  explanation?: string;
  media?: { type: "image" | "video"; url: string; filename: string };
};

type Question = { 
  id: string;
  text: string; 
  explanation?: string; 
  media?: { type: "image" | "video"; url: string; filename: string };
  choices: Choice[] 
};

interface RawChoice {
  text: string;
  isCorrect: boolean;
  explanation?: string;
  media?: { type: "image" | "video"; url: string; filename: string };
}

interface RawQuestion {
  id?: string;
  text: string;
  explanation?: string;
  media?: { type: "image" | "video"; url: string; filename: string };
  choices?: RawChoice[];
}

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [themeSlug, setThemeSlug] = useState("");
  const [difficulty, setDifficulty] = useState<
    "debutant" | "apprenti" | "expert" | "specialiste" | "maitre"
  >("debutant");
  const [iconUrl, setIconUrl] = useState<string>("");
  const [themes, setThemes] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    console.log('useEffect triggered', { status, dataLoaded: dataLoadedRef.current, sessionExists: !!session });
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") {
      router.replace("/connexion");
      return;
    }
    if (dataLoadedRef.current) {
      console.log('Data already loaded, skipping...');
      return; // Éviter les rechargements multiples
    }
    
    console.log('Loading data...');
    (async () => {
      try {
        const [themesRes, quizRes] = await Promise.all([
          fetch("/api/themes"),
          fetch(`/api/admin/quizzes/${id}`),
        ]);
        const themesData = await themesRes.json();
        if (themesRes.ok) setThemes(themesData.themes || []);
        const quizData = await quizRes.json();
        if (!quizRes.ok) throw new Error(quizData?.error || "Erreur");
        const q = quizData.quiz;
        setTitle(q.title || "");
        setDescription(q.description || "");
        setIsPublished(!!q.isPublished);
        setThemeSlug(q.themeSlug || "");
        setDifficulty(q.difficulty || "debutant");
        setIconUrl(q.iconUrl || "");
        setQuestions(
          (q.questions || []).map((qq: RawQuestion) => ({
            id: qq.id ?? `question-${Date.now()}-${Math.random()}`,
            text: qq.text,
            explanation: qq.explanation,
            media: qq.media,
            choices: (qq.choices || []).map((c: RawChoice) => ({
              text: c.text,
              isCorrect: !!c.isCorrect,
              explanation: c.explanation,
              media: c.media,
            })),
          }))
        );
        dataLoadedRef.current = true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session, id, router]);

  const addQuestion = useCallback(() => {
    console.log('Adding question...');
    setQuestions((prev) => {
      console.log('Previous questions:', prev.length);
      const newQuestions = [
        ...prev,
        {
          id: `question-${Date.now()}-${Math.random()}`,
          text: "",
          choices: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ];
      console.log('New questions:', newQuestions.length);
      return newQuestions;
    });
  }, []);

  function removeQuestion(questionId: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }
  
  function addChoice(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : {
              ...q,
              choices: [...q.choices, { text: "", isCorrect: false }],
            }
      )
    );
  }

  function removeChoice(questionId: string, choiceIndex: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : {
              ...q,
              choices: q.choices.filter((_, index) => index !== choiceIndex),
            }
      )
    );
  }

  function updateChoiceText(questionId: string, choiceIndex: number, text: string) {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id !== questionId
          ? question
          : {
              ...question,
              choices: question.choices.map((choice, j) => (j !== choiceIndex ? choice : { ...choice, text })),
            }
      )
    );
  }

  function updateChoiceCorrect(questionId: string, choiceIndex: number, isCorrect: boolean) {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id !== questionId
          ? question
          : {
              ...question,
              choices: question.choices.map((choice, j) => (j !== choiceIndex ? choice : { ...choice, isCorrect })),
            }
      )
    );
  }

  function updateQuestionExplanation(questionId: string, explanation: string) {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id !== questionId ? question : { ...question, explanation }
      )
    );
  }

  function updateQuestionMedia(questionId: string, media: { type: "image" | "video"; url: string; filename: string } | null) {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id !== questionId ? question : { ...question, media: media || undefined }
      )
    );
  }

  function updateChoiceExplanation(questionId: string, choiceIndex: number, explanation: string) {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id !== questionId
          ? question
          : {
              ...question,
              choices: question.choices.map((choice, j) => (j !== choiceIndex ? choice : { ...choice, explanation })),
            }
      )
    );
  }

  function updateChoiceMedia(questionId: string, choiceIndex: number, media: { type: "image" | "video"; url: string; filename: string } | null) {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id !== questionId
          ? question
          : {
              ...question,
              choices: question.choices.map((choice, j) => (j !== choiceIndex ? choice : { ...choice, media: media || undefined })),
            }
      )
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Validation côté client
    if (questions.length === 0) {
      setError("Veuillez ajouter au moins une question.");
      setSaving(false);
      return;
    }
    
    for (const q of questions) {
      if (!q.text.trim()) {
        setError("Toutes les questions doivent avoir un énoncé.");
        setSaving(false);
        return;
      }
      if (q.choices.length < 2) {
        setError("Chaque question doit avoir au moins 2 choix.");
        setSaving(false);
        return;
      }
      const hasValidChoice = q.choices.some(c => c.text.trim());
      if (!hasValidChoice) {
        setError("Chaque question doit avoir au moins un choix valide.");
        setSaving(false);
        return;
      }
      const hasCorrectChoice = q.choices.some(c => c.isCorrect && c.text.trim());
      if (!hasCorrectChoice) {
        setError("Chaque question doit avoir au moins une réponse correcte.");
        setSaving(false);
        return;
      }
    }
    
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          isPublished,
          themeSlug: themeSlug || undefined,
          difficulty,
          iconUrl: iconUrl || null,
          questions: questions.map(q => ({
            text: q.text,
            explanation: q.explanation,
            media: q.media,
            choices: q.choices
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      router.replace("/admin/quizzes");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Chargement...</p>;

  console.log('Rendering with questions:', questions.length);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Éditer le quizz</h1>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid gap-4 rounded-xl border border-black/[.08] bg-white p-4">
          <label className="block">
            <div className="text-sm mb-1">Titre</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <div className="text-sm mb-1">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span>Publier</span>
          </label>
          <label className="block">
            <div className="text-sm mb-1">Thématique</div>
            <select
              value={themeSlug}
              onChange={(e) => setThemeSlug(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">— Aucune —</option>
              {themes.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="text-sm mb-1">Niveau</div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "debutant" | "apprenti" | "expert" | "specialiste" | "maitre")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="debutant">Débutant</option>
              <option value="apprenti">Apprenti</option>
              <option value="expert">Expert</option>
              <option value="specialiste">Spécialiste</option>
              <option value="maitre">Maître</option>
            </select>
          </label>
          <div>
            <ImageUpload
              currentImageUrl={iconUrl}
              onImageUpload={setIconUrl}
              onImageRemove={() => setIconUrl("")}
              label="Icône du quiz (optionnel)"
              folder="quiz-icons"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-black/[.08] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button type="button" onClick={addQuestion} className="text-sm rounded-md bg-blue-600 text-white px-3 py-1 hover:bg-blue-700">Ajouter une question</button>
          </div>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune question ajoutée pour le moment.</p>
              <p className="text-sm">Cliquez sur &quot;Ajouter une question&quot; pour commencer.</p>
            </div>
          ) : (
            questions.map((q, qi) => (
            <div key={q.id} className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Question {qi + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-sm text-red-600 hover:text-red-800 px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
              <label className="block">
                <div className="text-sm mb-1">Énoncé</div>
                <input
                  value={q.text}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((qq) =>
                        qq.id !== q.id ? qq : { ...qq, text: e.target.value }
                      )
                    )
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Entrez l'énoncé de la question..."
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1">Explication</div>
                <textarea
                  value={q.explanation}
                  onChange={(e) => updateQuestionExplanation(q.id, e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </label>
                             <MediaUpload
                 currentMedia={q.media}
                 onMediaUpload={(media) => updateQuestionMedia(q.id, media)}
                 label="Média pour la question (optionnel)"
               />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Choix</div>
                  <button
                    type="button"
                    onClick={() => addChoice(q.id)}
                    className="text-sm border rounded px-3 py-1"
                  >
                    Ajouter un choix
                  </button>
                </div>
                {q.choices.map((c, ci) => (
                  <div
                    key={ci}
                    className="border rounded p-3 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={c.text}
                        onChange={(e) => updateChoiceText(q.id, ci, e.target.value)}
                        className="flex-1 border rounded px-3 py-2"
                        placeholder={`Choix ${ci + 1}...`}
                      />
                      <label className="inline-flex items-center gap-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={c.isCorrect}
                          onChange={(e) => updateChoiceCorrect(q.id, ci, e.target.checked)}
                        />
                        <span>Correct</span>
                      </label>
                      {q.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(q.id, ci)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                                         <label className="block">
                       <div className="text-sm mb-1">Explication du choix (optionnel)</div>
                       <textarea 
                         value={c.explanation || ""} 
                         onChange={(e) => updateChoiceExplanation(q.id, ci, e.target.value)} 
                         className="w-full border rounded px-3 py-2" 
                         placeholder={c.isCorrect ? "Expliquez pourquoi cette réponse est correcte..." : "Expliquez pourquoi cette réponse est incorrecte..."}
                       />
                     </label>

                     <MediaUpload
                       onMediaUpload={(media) => updateChoiceMedia(q.id, ci, media)}
                       currentMedia={c.media}
                       label="Média pour ce choix (optionnel)"
                     />
                  </div>
                ))}
              </div>
            </div>
            ))
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="inline-flex items-center rounded-lg bg-blue-600 text-white px-5 py-2 disabled:opacity-50 hover:bg-blue-700">{saving ? "Enregistrement..." : "Enregistrer"}</button>
      </form>
    </div>
  );
}
