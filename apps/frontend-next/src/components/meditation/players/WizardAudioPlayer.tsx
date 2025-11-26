"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Propriétés du composant `WizardAudioPlayer`.
 *
 * Ce player est utilisé dans le wizard de méditation pour lire un contenu audio
 * associé à une séance. Il se concentre sur :
 * - la gestion du bouton play/pause
 * - la détection de la fin de la piste (`onEnd`)
 * - la synchronisation d’état via un ref audio HTML standard
 */
type WizardAudioPlayerProps = {
    /** Titre affiché au-dessus du player (nom du contenu de méditation). */
    title: string;

    /** URL du fichier audio (souvent un .mp3 récupéré depuis l’API). */
    mediaUrl: string;

    /**
     * Callback exécuté automatiquement lorsque la piste audio se termine.
     * Utilisé pour passer à l’étape suivante du wizard.
     */
    onEnd: () => void;
};

/**
 * Player audio minimaliste dédié au wizard de méditation.
 *
 * Fonctionnalités :
 * - gestion locale de l’état `isPlaying`
 * - ajout / retrait d’un listener `ended` sur l’élément audio
 * - contrôle play/pause par un bouton unique
 *
 * L’objectif est de proposer une interface simple évitant les contrôles natifs,
 * afin de conserver la cohérence visuelle du wizard.
 *
 * @param props Voir {@link WizardAudioPlayerProps}.
 * @returns Secteur JSX contenant le titre, l’élément audio et un bouton Play/Pause.
 */
export default function WizardAudioPlayer({
                                              title,
                                              mediaUrl,
                                              onEnd,
                                          }: WizardAudioPlayerProps) {
    /** Référence vers l’élément `<audio>` pour contrôler la lecture. */
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /** Indique si l’audio est actuellement en lecture. */
    const [isPlaying, setIsPlaying] = useState(false);

    /**
     * Attache un listener `ended` lorsque le composant est monté.
     * Ce listener :
     *  - met à jour l’état local
     *  - appelle la fonction `onEnd`
     *
     * Nettoyage assuré lors du démontage.
     */
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setIsPlaying(false);
            onEnd();
        };

        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [onEnd]);

    /**
     * Inverse l’état de lecture :
     * - si l’audio est en lecture : pause
     * - sinon : relance la lecture
     */
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>

            {/* Élément audio invisible : piloté uniquement via le bouton */}
            <audio ref={audioRef} src={mediaUrl} preload="auto" />

            <button
                type="button"
                onClick={togglePlay}
                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
                {isPlaying ? "Pause" : "Play"}
            </button>
        </div>
    );
}
