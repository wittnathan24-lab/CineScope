import { useState } from "react";
import { useCollection } from "../context/CollectionContext";
import type { Profile } from "../types/movie";
const fields: { key: keyof Profile; label: string; placeholder: string }[] = [
  { key: "firstName", label: "Prénom", placeholder: "Votre prénom" },
  { key: "lastName", label: "Nom", placeholder: "Votre nom" },
  { key: "nickname", label: "Pseudonyme", placeholder: "Votre pseudonyme" },
  { key: "email", label: "Adresse e-mail", placeholder: "votre@email.com" },
  {
    key: "bio",
    label: "Biographie",
    placeholder: "Parlez-nous un peu de vous...",
  },
];
function validate(value: Profile) {
  const errors: Partial<Record<keyof Profile, string>> = {};
  for (const { key } of fields) {
    if (key !== "bio" && !value[key].trim())
      errors[key] = "Ce champ est obligatoire.";
  }
  if (
    value.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())
  )
    errors.email = "Veuillez saisir une adresse e-mail valide.";
  return errors;
}
export default function ProfilePage() {
  const { state, dispatch } = useCollection();
  const [value, setValue] = useState(state.profile);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const errors = submitted ? validate(value) : {};
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 1, ...state }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "cinescope-sauvegarde.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="page">
      <p className="eyebrow">Un espace à votre image</p>
      <h1>Mon profil</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <form
          noValidate
          className="panel grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            setSuccess(false);
            if (!Object.keys(validate(value)).length) {
              dispatch({
                type: "profile",
                value: Object.fromEntries(
                  Object.entries(value).map(([k, v]) => [k, v.trim()]),
                ) as Profile,
              });
              setSuccess(true);
            }
          }}
        >
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-2 block text-sm" htmlFor={key}>
                {label}
                {key !== "bio" && <span className="text-amber-200"> *</span>}
              </label>
              {key === "bio" ? (
                <textarea
                  id={key}
                  className="field min-h-28 w-full"
                  maxLength={1000}
                  placeholder={placeholder}
                  value={value[key]}
                  onChange={(e) => {
                    setValue({ ...value, [key]: e.target.value });
                    setSuccess(false);
                  }}
                />
              ) : (
                <input
                  id={key}
                  className="field w-full"
                  type={key === "email" ? "email" : "text"}
                  required
                  maxLength={150}
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `${key}-error` : undefined}
                  placeholder={placeholder}
                  value={value[key]}
                  onChange={(e) => {
                    setValue({ ...value, [key]: e.target.value });
                    setSuccess(false);
                  }}
                />
              )}
              {errors[key] && (
                <p id={`${key}-error`} className="mt-1 text-sm text-red-300">
                  {errors[key]}
                </p>
              )}
            </div>
          ))}
          <button className="btn justify-self-start">
            Enregistrer mon profil
          </button>
          {success && (
            <p role="status" className="text-emerald-300">
              Profil enregistré avec succès.
            </p>
          )}
        </form>
        <aside className="space-y-5">
          <section className="panel">
            <p className="eyebrow">Votre parcours cinéphile</p>
            <h2 className="mb-5 text-2xl">
              {state.profile.nickname || "Bienvenue"}
            </h2>
            {[
              [state.favorites.length, "films favoris"],
              [
                state.library.filter((e) => e.status === "watched").length,
                "films vus",
              ],
              [Object.keys(state.ratings).length, "notes personnelles"],
            ].map(([count, label]) => (
              <p
                key={label}
                className="mb-4 flex items-center gap-4 text-sm text-stone-400"
              >
                <strong className="text-3xl text-amber-200">{count}</strong>
                {label}
              </p>
            ))}
          </section>
          <section className="panel">
            <h2 className="mb-3 text-xl">Vos données vous appartiennent</h2>
            <p className="mb-5 text-sm leading-6 text-stone-400">
              Enregistrées dans ce navigateur, sans compte en ligne. Téléchargez
              une copie de votre profil, de vos listes et de vos notes.
            </p>
            <button className="btn-secondary" onClick={exportData}>
              Exporter mes données
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
