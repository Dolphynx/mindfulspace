const fr = {
    /*
     * Common
     */
    common: {
        appName: "MindfulSpace",
    },

    metadataLayout: {
        defaultTitle: "MindfulSpace – Prends soin de ton esprit",
        description:
            "MindfulSpace t'aide à suivre ton bien-être (sommeil, respiration, méditation) et à développer une routine plus apaisée. Projet étudiant HELMo.",
    },

    /*
     * Navigation
     */
    nav: {
        resources: "Ressources",
        coach: "Devenir coach",
        contact: "Contact",
        clientSpace: "Espace client",
        breathing: "Respiration",
        dashboard: "Tableau de bord",
        objectives: "Objectifs",
        becomeCoach: "Devenir coach",
        world: "Mon monde",
        world2: "Ma carte bien-être",
        badges: "Mes badges",
        meditation: "Méditation",
        exercise: "Exercices",
        sleep: "Sommeil"
    },

    navbar: {
        resources: "Ressources",
        becomecoach: "Devenir coach",
        contact: "Contact",
        clientSpace: "Espace client",
        breathing: "Respiration",
        dashboard: "Dashboard",
        objectives: "Objectifs",
        mobileToggle: "Ouvrir le menu",
        world: "Mon monde",
        world2: "Ma carte bien-être",
        badges: "Mes badges",
        meditation: "Méditation",
        exercise: "Exercices",
        sleep: "Sommeil"
    },

    navbarCoach: {
        emptyPlaceholder: "Menu coach",
        resources: "Mes ressources",
        backToApp: "Retour à l'app",
    },

    navbarAdmin: {
        emptyPlaceholder: "Menu admin",
        resources: "Gestion des ressources",
        sessions: "Sessions de méditation",
        backToApp: "Retour à l'app",
    },

    adminDashboard: {
        title: "Panneau administrateur",
        tabs: {
            dashboard: "Tableau de bord",
            resources: "Ressources",
            taxonomy: "Taxonomie",
            profile: "Mon profil",
        },
        backToApp: "Retour à l'app",
        welcome: "Bienvenue dans le panneau d'administration MindfulSpace",
        stats: {
            totalUsers: "Total Utilisateurs",
            resources: "Ressources",
            sessions: "Sessions",
        },
        errors: {
            loadStatsFailed: "Échec du chargement des statistiques",
        },
    },

    /*
     * Pages
     */
    publicHome: {
        heroTitle: "Bienvenue sur MindfulSpace",
        heroSubtitle: "Suivez vos habitudes de bien-être, méditez, respirez.",

        welcomeTitle: "Prends un moment pour toi",
        welcomeParagraph1:
            "MindfulSpace est un espace pour suivre tes habitudes de bien-être, prendre du recul sur tes journées et installer une routine plus sereine.",
        welcomeParagraph2:
            "Respiration guidée, suivi de l'humeur, objectifs bien-être… l'idée n'est pas d'être parfait, mais de revenir régulièrement vers ce qui te fait du bien.",

        discoverTitle: "Découvrir MindfulSpace :",
        discoverResources: "Explorer les ressources (articles & vidéos)",
        discoverCoachs: "En savoir plus sur le rôle des coachs",
        discoverContact: "Contacter l'équipe MindfulSpace",

        ctaTitle: "Prêt·e à passer à l'action ?",
        ctaDescription:
            "Connecte-toi à ton espace pour suivre ton humeur, respirer guidé·e pas à pas et garder une trace de tes progrès.",

        loginButton: "Connectez-vous à votre compte",
        startBreathing: "Commencer une séance de respiration",

        disclaimer:
            "Pas encore de compte ? L'espace client fait partie du projet scolaire MindfulSpace et n'est pas destiné à un usage médical réel.",
    },

    contactPage: {
        heroTitle: "Contact",
        heroSubtitle: "Une question concernant MindfulSpace ?",

        teamTitle: "Équipe MindfulSpace",
        projectDescription:
            "MindfulSpace est un projet académique fictif développé dans le cadre d'un cursus en développement d'application.",
        projectWarning:
            "Aucune information fournie via cette plateforme n'est lue, traitée ni suivie par un professionnel de santé.",

        contactEmailLabel: "Email :",
        contactAddressLabel: "Adresse :",
        contactPhoneLabel: "Téléphone :",

        emergencyTitle: "Besoin d'aide urgente ?",
        emergencyDescription:
            "Cette application n'est pas un service médical. En cas de détresse émotionnelle ou de crise, contacte immédiatement un service d'urgence ou une ligne d'écoute professionnelle.",
    },

    cookiesPolicyPage: {
        title: "Politique de cookies",
        intro:
            "Cette page décrit comment MindfulSpace utilise les cookies et technologies similaires sur cette application. Ce projet est réalisé dans un cadre académique fictif et ne collecte aucune donnée à des fins commerciales.",

        section1Title: "1. Qu'est-ce qu'un cookie ?",
        section1Text:
            "Un cookie est un petit fichier texte enregistré sur votre appareil lors de la consultation d'un site web. Il permet à un site de reconnaître votre navigateur ou de mémoriser certaines informations.",

        section2Title: "2. Types de cookies utilisés",
        section2EssentialTitle: "Essentiels :",
        section2EssentialDesc: "nécessaires au bon fonctionnement du site (ex. mémorisation du consentement).",
        section2AnalyticsTitle: "Analytiques :",
        section2AnalyticsDesc: "permettent d'améliorer l'expérience utilisateur via des statistiques anonymisées. Ces cookies sont désactivés par défaut.",
        section2PersonalizationTitle: "Personnalisation :",
        section2PersonalizationDesc: "adaptent le contenu affiché. Désactivés par défaut.",

        section3Title: "3. Votre consentement",
        section3Text:
            "Lors de votre première visite, une bannière vous permet d'accepter ou de refuser les cookies non essentiels. Vous pouvez modifier ce choix à tout moment via le lien \"Préférences cookies\" en bas de page.",

        section4Title: "4. Données personnelles",
        section4Text:
            "MindfulSpace ne collecte, ne conserve ni ne partage aucune donnée personnelle. Les informations affichées dans l'application sont entièrement fictives et ne sont pas transmises à des tiers.",

        section5Title: "5. Contact",
        section5Text: "Pour toute question concernant cette politique, vous pouvez nous écrire à :",
    },

    offlinePage: {
        heroTitle: "Vous êtes hors connexion",
        heroSubtitle: "Certaines fonctionnalités de MindfulSpace ne sont pas disponibles sans internet.",

        card1Title: "Impossible de joindre le serveur",
        card1Intro:
            "MindfulSpace n'arrive pas à se connecter. Cela peut être dû à une coupure de votre connexion internet ou à un problème réseau temporaire.",
        card1Item1: "Vérifiez que votre Wi-Fi ou vos données mobiles sont activés.",
        card1Item2:
            "Si possible, rapprochez-vous de votre routeur ou d'une zone de meilleure couverture.",
        card1Item3: "Essayez de recharger la page une fois la connexion rétablie.",
        card1Note:
            "Si vous aviez déjà ouvert certaines pages, elles peuvent encore être visibles même hors connexion.",

        card2Title: "Revenir à MindfulSpace",
        card2Text:
            "Dès que votre connexion est rétablie, vous pouvez revenir au tableau de bord principal pour continuer à suivre vos habitudes de bien-être.",
        card2Button: "Retour au tableau de bord",
    },

    formationPage: {
        heroTitle: "Devenir Coach Bien-Être",
        heroSubtitle: "Transformez des vies — et la vôtre — grâce à notre programme certifié MindfulSpace.",

        whyTitle: "Pourquoi devenir coach ?",
        why1Title: "Construire une communauté",
        why1Text: "Accompagner des personnes en quête de bien-être et créer un espace de soutien positif.",
        why2Title: "Développer sa pratique",
        why2Text: "Élargir son impact et proposer un accompagnement structuré grâce à nos outils.",
        why3Title: "Faire une différence",
        why3Text: "Aider les autres à atteindre leurs objectifs de santé mentale et d'équilibre.",
        why4Title: "Gagner en reconnaissance",
        why4Text: "Obtenir une certification et renforcer sa crédibilité professionnelle.",

        programTitle: "Programme de formation complet",
        programSubtitle: "Une formation structurée sur 12 semaines, conçue avec des experts du bien-être.",

        program1Title: "Fondations du coaching bien-être",
        program1Duration: "4 semaines",
        program1Item1: "Principes du coaching",
        program1Item2: "Compétences en communication",
        program1Item3: "Techniques de définition d'objectifs",

        program2Title: "Nutrition & Hygiène de vie",
        program2Duration: "3 semaines",
        program2Item1: "Bases de la nutrition",
        program2Item2: "Interventions liées au mode de vie",
        program2Item3: "Construction d'habitudes durables",

        program3Title: "Santé mentale & Pleine conscience",
        program3Duration: "3 semaines",
        program3Item1: "Gestion du stress",
        program3Item2: "Techniques de méditation",
        program3Item3: "Intelligence émotionnelle",

        program4Title: "Gestion de la pratique professionnelle",
        program4Duration: "2 semaines",
        program4Item1: "Gestion des clients",
        program4Item2: "Bases du business",
        program4Item3: "Éthique & limites professionnelles",

        pricingTitle: "Choisissez votre parcours",

        pricing1Title: "Fondation",
        pricing1Price: "499€",
        pricing1F1: "Programme complet",
        pricing1F2: "Apprentissage autonome",
        pricing1F3: "Certification digitale",
        pricing1F4: "Accès à la bibliothèque de resources",
        pricing1F5: "Accès au forum de la communauté",

        pricing2Title: "Professionnel",
        pricing2Price: "899€",
        pricing2F1: "Tout ce qui est inclus dans Foundation",
        pricing2F2: "Sessions de coaching en direct",
        pricing2F3: "Programme de mentorat",
        pricing2F4: "Certifications avancées",
        pricing2F5: "Boîte à outils marketing",
        pricing2F6: "Support prioritaire",

        pricing3Title: "Élite",
        pricing3Price: "1499€",
        pricing3F1: "Tout ce qui est inclus dans Professionnel",
        pricing3F2: "Mentorat individuel",
        pricing3F3: "Coaching en développement professionnel",
        pricing3F4: "Profil coach mis en avant",
        pricing3F5: "Accès plateforme à vie",
        pricing3F6: "Crédits de formation continue",

        pricingButton: "Commencer",

        ctaTitle: "Prêt à commencer votre parcours ?",
        ctaSubtitle:
            "Rejoignez les coachs certifiés MindfulSpace et faites une réelle différence dans la vie des autres. Créez un compte ou connectez-vous pour accéder à votre profil, où vous pourrez introduire une demande pour devenir coach à tout moment.",
        ctaButtonPrimary: "S’inscrire maintenant",
        ctaButtonSecondary: "En savoir plus",
    },

    premiumPage: {
        heroTitle: "Passer Premium",
        heroSubtitle: "Débloquez des contenus exclusifs, des programmes avancés et un suivi plus riche avec MindfulSpace Premium.",

        whyTitle: "Pourquoi devenir Premium ?",
        why1Title: "Accéder aux ressources premium",
        why1Text: "Articles, vidéos et guides approfondis pour aller plus loin dans votre bien-être au quotidien.",
        why2Title: "Programmes & sessions exclusifs",
        why2Text: "Séances guidées premium et programmes structurés pour progresser plus vite et plus sereinement.",
        why3Title: "Être notifié des nouveautés",
        why3Text: "Recevez des alertes dès qu’un nouveau contenu premium est disponible (programmes, méditations, ressources).",
        why4Title: "Accélérer vos progrès",
        why4Text: "Des outils et parcours avancés pour construire des habitudes durables et garder votre motivation.",

        programTitle: "Tout ce que Premium débloque",
        programSubtitle: "Une expérience enrichie, conçue pour vous accompagner plus loin, plus longtemps.",

        program1Title: "Bibliothèque premium",
        program1Duration: "Accès illimité",
        program1Item1: "Ressources exclusives (articles, vidéos, guides)",
        program1Item2: "Contenus plus approfondis et pratiques",
        program1Item3: "Favoris & accès rapide",

        program2Title: "Programmes premium",
        program2Duration: "Nouveaux parcours régulièrement",
        program2Item1: "Programmes structurés (stress, sommeil, concentration, etc.)",
        program2Item2: "Progression étape par étape",
        program2Item3: "Objectifs et recommandations",

        program3Title: "Sessions premium",
        program3Duration: "Nouveautés chaque mois",
        program3Item1: "Méditations guidées premium",
        program3Item2: "Séances thématiques (anxiété, énergie, gratitude…)",
        program3Item3: "Durées variées pour s’adapter à votre emploi du temps",

        program4Title: "Notifications & suivi",
        program4Duration: "Toujours à jour",
        program4Item1: "Notifications de nouveaux contenus premium",
        program4Item2: "Rappels personnalisés (selon vos objectifs)",
        program4Item3: "Historique et progression améliorés",

        pricingTitle: "Choisissez votre formule",

        pricing1Title: "Mensuel",
        pricing1Price: "9,99€/mois",
        pricing1F1: "Accès aux ressources premium",
        pricing1F2: "Sessions premium",
        pricing1F3: "Notifications des nouveautés",
        pricing1F4: "Annulation à tout moment",
        pricing1F5: "Accès multi-appareils",

        pricing2Title: "Annuel",
        pricing2Price: "79,99€/an",
        pricing2F1: "Tout ce qui est inclus dans Mensuel",
        pricing2F2: "Meilleur prix sur l’année",
        pricing2F3: "Accès complet aux programmes premium",
        pricing2F4: "Priorité sur les nouveautés",
        pricing2F5: "Rappels personnalisés",
        pricing2F6: "Support prioritaire",

        pricing3Title: "Famille",
        pricing3Price: "119,99€/an",
        pricing3F1: "Tout ce qui est inclus dans Annuel",
        pricing3F2: "Jusqu’à 5 comptes",
        pricing3F3: "Programmes premium pour toute la famille",
        pricing3F4: "Préférences par profil",
        pricing3F5: "Accès multi-appareils",
        pricing3F6: "Support prioritaire",

        pricingButton: "Commencer",

        ctaTitle: "Passer Premium en quelques étapes",
        ctaSubtitle:
            "Créez un compte ou connectez-vous pour accéder à votre profil, où vous pourrez activer l’abonnement Premium à tout moment.",
        ctaButtonPrimary: "Activer Premium",
        ctaButtonSecondary: "En savoir plus"
    },


    resourcesPage: {
        heroTitle: "Ressources",
        heroSubtitle: "Explore notre collection d'articles et de guides autour du bien-être.",

        searchLabel: "Rechercher une ressource",
        searchPlaceholder: "Tape un mot-clé (méditation, sommeil, stress...)",

        allCategories: "Toutes",

        listTitle: "Ressources disponibles",
        loading: "Chargement des ressources…",
        empty: "Aucune ressource ne correspond à ta recherche pour le moment.",

        premiumBadge: "Premium",
        premiumIconAlt: "Contenu premium",
        lockedPremiumResource: "Ressource premium réservée aux membres premium",
        lockedPremiumTooltip: "Devenez membre premium pour accéder à ce contenu",
        readTimeSuffix: "min",
        manageMyResources: "Gestion de mes ressources",
        viewAllResources: "Voir toutes les ressources",
    },
    breathingSession: {
        title: "Respiration guidée",

        phaseInhale: "Inspirez",
        phaseHold: "Bloquez",
        phaseExhale: "Expirez",
        hold_full: "Bloquez la respiration…",
        hold_empty: "Relâchez…",

        cycle: "Cycle",
        followInstruction: "Suivez le rythme de respiration",

        skipStep: "Skip respi",
        skipAll: "Skip all",

        nextStep: "Étape suivante",
    },

    sessionRecap: {
        title: "Séance terminée",
        progressMessage: "Vous progressez sur le chemin de la paix",
        dashboardButton: "Mon suivi",
        redoButton: "Refaire une séance",
        reminder: "Revenez demain pour continuer votre pratique",
    },

    moodSession: {
        title: "Comment vous sentez-vous ?",
        subtitle: "Prenez un moment pour reconnaître vos émotions",
        continue: "Continuer",
        note: "Il n'y a pas de bonne ou mauvaise réponse",
    },

    tipSession: {
        title: "Astuce du jour",
        tipSourceLabel: "Astuce venant du JSON",
        mantraSourceLabel: "Astuce venant de Groq (IA)",
        finishButton: "Terminer la séance",
        keepThought: "Gardez cette pensée avec vous aujourd'hui",
        fallbackTip: "Prenez une grande respiration et souriez 🌿",
    },

    domainSleep: {
        title: "Sommeil",
        subtitle: "Conseils et outils pour améliorer la qualité de votre sommeil.",
        empty: "Contenu prochainement disponible…",

        history_summary_nights: "nuits",
        history_summary_hoursAvg: "heures en moyenne",
        history_toggle_expand: "Afficher le détail",
        history_toggle_collapse: "Masquer le détail",
        history_totalSleepLabel: "Sommeil au total",
        history_totalNightsLabel: "Nombre de nuits",
        history_averageQualityLabel: "Qualité moyenne",

        // Encodage manuel (unique pour le sommeil)
        manualForm_title: "Encoder une nuit de sommeil",
        manualForm_description: "Notez vos heures de coucher et de lever, ainsi que la qualité de votre nuit.",
        manualForm_placeholder: "Le formulaire pour encoder vos nuits de sommeil sera bientôt disponible.",
        manualForm_durationLabel: "Durée du sommeil",
        manualForm_saveButton: "Enregistrer",
        manualForm_cancelButton: "Annuler",
        manualForm_dateLabel: "Date",
        manualForm_qualityLabel: "Qualité perçue",

        // Historique
        history_title: "Vos dernières nuits",
        history_placeholder: "L'historique de vos nuits apparaîtra ici dès que vous aurez encodé quelques jours.",
        history_nights: "nuits",
        last7_empty: "Aucune donnée enregistrée sur les 7 derniers jours.",
        history_average: "heures en moyenne",

        detail: {
            kpisTitle: "Indicateurs",
            trendTitle: "Tendance",
            historyTitle: "Historique",
            kpi: {
                weekHours: "Heures (7 jours)",
                avg30: "Moyenne (30 jours)",
                streak: "Série",
                streakBestPrefix: "Meilleure série :",
                avgQuality: "Qualité moyenne",
                na: "—",
            },
            trendHours30: "Heures par nuit (30 derniers jours)",
            trendSma5: "Lissage (5)",
            insightsTitle: "Insights (30 jours)",
            insights: {
                activeNights: "Nuits encodées",
                bestNight: "Meilleure nuit",
                goodQuality: "Qualité ≥ 4/5",
                goodQualityHint: "sur les nuits encodées",
                variability: "Variabilité",
                variabilityHint: "écart-type (h)",
                activeDays: "Jours actifs",
                totalMinutes: "Temps total",
                bestDay: "Meilleur jour",
                top3Types: "Top 3 types",
                coverage: "Couverture",
                goodQualityShort: "≥ 4/5",
            },
        },
    },

    domainExercice: {
        title: "Exercice",
        subtitle: "Suivez et enregistrez vos séances d'exercice.",

        history_summary_sessions: "séances",
        history_summary_exercises: "exercices",
        history_toggle_expand: "Afficher le détail",
        history_toggle_collapse: "Masquer le détail",
        history_totalRepsLabel: "Répétitions au total",
        history_totalSessionsLabel: "Nombre de séances",
        history_averageQualityLabel: "Qualité moyenne",
        history_dayLabel: "Jour",
        history_totalLabel: "au total",
        history_sessionsLabel: "séance",

        // Encodage manuel
        manualForm_title: "Encoder une séance passée",
        manualForm_description: "Indiquez la date, le type d'exercice et le nombre de répétitions.",
        manualForm_dateLabel: "Date de la séance",
        manualForm_typeLabel: "Type d’exercice",
        manualForm_typePlaceholder: "Choisis un exercice",
        manualForm_repetitionsLabel: "Nombre de répétitions",
        manualForm_qualityLabel: "Qualité / effort ressenti",
        manualForm_saveButton: "Enregistrer la séance",
        manualForm_savingButton: "Enregistrement…",
        manualForm_cancelButton: "Annuler",
        manualForm_repetitionLabel: "Nombre de séries",
        manualForm_button: "Encoder une session",

        // Lancer une séance guidée
        start_title: "Lancer une séance d'exercice",
        start_button: "Commencer exercice",
        start_description: "Choisissez un exercice et laissez-vous guider pas à pas.",
        start_placeholder: "Le démarrage guidé d'une séance d'exercice sera bientôt disponible.",
        start_nextButton: "Suivant",
        start_prevButton: "Précédent",
        start_finishButton: "Terminé",

        // Historique
        history_title: "Vos dernières séances d'exercice",
        history_placeholder: "Votre historique apparaîtra ici dès que vous aurez enregistré des séances.",

        // Workout Programs
        program_start_title: "S'abonner à un programme d'exercice",
        program_start_description: "Découvrez des programmes guidés pour rester régulier.",
        program_start_button: "Voir les programmes disponibles",

        program_list_loading: "Chargement des programmes…",
        program_list_title: "Programmes disponibles",
        program_list_days: "jours",
        program_list_seeDetails: "Voir les détails",
        program_list_daysPerWeek: "jours/semaine",
        program_details_back: "Retour",
        program_details_subscribe: "S'abonner",
        program_details_unsubscribe: "Se désabonner",

        exercice_plan_today_title: "Exercices du jour",
        exercice_plan_today_empty: "Rien de prévu aujourd'hui",
        exercice_plan_loading: "Chargement...",

        weekday_0: "Dimanche",
        weekday_1: "Lundi",
        weekday_2: "Mardi",
        weekday_3: "Mercredi",
        weekday_4: "Jeudi",
        weekday_5: "Vendredi",
        weekday_6: "Samedi",

        detail: {
            kpisTitle: "Indicateurs",
            trendTitle: "Tendance",
            historyTitle: "Historique",
            kpi: {
                weekReps: "Répétitions (7 jours)",
                avg30: "Moyenne (30 jours)",
                streak: "Série",
                streakBestPrefix: "Meilleure série :",
                topExercise: "Exercice favori",
                na: "—",
            },
            trend30: "Volume (30 derniers jours)",
            trendSma5: "Lissage (5)",
            insightsTitle: "Insights (30 jours)",
            insights: {
                activeDays: "Jours actifs",
                totalMinutes: "Temps total",
                bestDay: "Meilleur jour",
                top3: "Top 3 types",
                totalReps: "Total répétitions",
                coverage: "Couverture",
                intensity: "Intensité",
                intensityHint: "Répétitions par séance",
            },
        },
    },

    domainMeditation: {

        // --- Wizard: types ---
        wizard_loadingTypes: "Chargement des types de méditation…",
        wizard_errorTypes: "Impossible de charger les types de méditation.",
        wizard_stepType_title: "Quel type de méditation souhaites-tu pratiquer ?",

        // --- Wizard: durée ---
        wizard_stepDuration_title: "Choisis la durée de ta séance",
        wizard_minutes: "minutes",
        wizard_backToType: "Retour au choix du type",

        // --- Wizard: contenu ---
        wizard_stepContent_title: "Choisis un contenu",
        wizard_loadingContents: "Chargement des contenus de méditation…",
        wizard_errorContents: "Impossible de charger les contenus de méditation.",
        wizard_stepContent_empty: "Aucun contenu disponible pour cette combinaison type + durée.",
        wizard_premium: "Premium",
        wizard_backToDuration: "Retour au choix de la durée",

        // --- Wizard: humeur avant ---
        wizard_stepMoodBefore_title: "Comment te sens-tu avant cette séance ?",
        wizard_backToContent: "Retour au choix du contenu",
        wizard_startSession: "Commencer la séance",

        // --- Wizard: playing (audio / timer / visuel) ---
        wizard_stepPlaying_title: "Ta séance en cours :",
        wizard_stepPlaying_placeholder: "Cette pratique n'est pas encore disponible dans cette version de l'application.",
        wizard_endSession: "Terminer la séance",
        wizard_cancel: "Annuler la séance",

        // --- Wizard: humeur après ---
        wizard_stepMoodAfter_title: "Comment te sens-tu après cette séance ?",
        wizard_saveError: "Une erreur est survenue lors de l'enregistrement de ta séance.",
        wizard_saving: "Enregistrement…",
        wizard_save: "Enregistrer ma séance",

        // --- Wizard: done ---
        wizard_stepDone_title: "Bravo, ta séance a été enregistrée !",
        wizard_stepDone_description: "Continue à pratiquer régulièrement pour renforcer ton bien-être au quotidien.",
        wizard_close: "Fermer",

        // --- Timer du wizard ---
        wizard_timer_remainingLabel: "Temps restant",
        wizard_timer_pause: "Pause",
        wizard_timer_resume: "Reprendre",
        wizard_timer_reset: "Réinitialiser",
        wizard_timer_finished: "Séance terminée",

        // --- Historique 7 derniers jours ---
        last7_title: "Tes 7 derniers jours de méditation",
        last7_empty: "Aucune séance enregistrée sur les 7 derniers jours.",
        last7_toggle_expand: "Afficher le détail",
        last7_toggle_collapse: "Masquer le détail",
        last7_totalMeditationLabel: "Méditation au total",
        last7_totalSessionsLabel: "Nombre de séances",
        last7_averageMoodLabel: "Humeur moyenne",
        last7_dayLabel: "Jour",
        last7_totalLabel: "au total",

        // Petites étiquettes génériques si tu en as besoin
        sessionsLabel: "séances",
        minutesLabel: "minutes",

        title: "Méditation",
        subtitle: "Pratiques guidées pour apaiser votre esprit.",
        empty: "Contenu prochainement disponible…",

        // Encodage manuel
        manualForm_title: "Encoder une séance passée",
        manualForm_description: "Indiquez la date, la durée et, si vous le souhaitez, la qualité ressentie.",
        manualForm_dateLabel: "Date",
        manualForm_durationLabel: "Durée",
        manualForm_minutesSuffix: "minutes",
        manualForm_qualityLabel: "Qualité perçue",
        manualForm_saveButton: "Enregistrer la séance",
        manualForm_savingButton: "Enregistrement…",
        manualForm_typeLabel: "Type de méditation",
        manualForm_button: "Encoder une méditation",
        manualForm_cancelButton: "Annuler",

        // Player / minuteur
        player_title: "Lancer une séance de méditation",
        player_description: "Choisissez une durée et laissez-vous guider par le minuteur.",
        player_startButton: "Commencer une méditation",
        player_modalTitle: "Méditation guidée par minuteur",
        player_configText: "Choisissez la durée de votre séance. Vous pourrez arrêter plus tôt si nécessaire.",
        player_durationLabel: "Durée souhaitée",
        player_startNowButton: "Lancer la séance",
        player_runningText: "La séance est en cours. Fermez les yeux, respirez paisiblement.",
        player_stopEarlyButton: "Terminer la séance",
        player_finishedText: "La séance est terminée. Comment évaluez-vous la qualité de ce moment ?",
        player_finishedQualityLabel: "Qualité de la séance",
        player_saveButton: "Enregistrer cette séance",
        player_savingButton: "Enregistrement…",

        // 7 dernières
        last7_description: "Aperçu de vos méditations récentes.",
        last7_loading: "Chargement…",
        last7_durationLabel: "Durée",
        last7_qualityLabel: "Qualité",

        errors: {
            loadTypes: "Erreur lors du chargement des types de méditation",
            loadSessions: "Impossible de charger les séances",
            saveSession: "Erreur lors de l'enregistrement de la séance"
        },

        meditationTypes: {
            breathing: {
                name: "Respiration consciente",
                description:
                    "Focalisation sur le souffle pour apaiser le système nerveux.",
            },
            mindfulness: {
                name: "Pleine conscience",
                description:
                    "Observer pensées, émotions et sensations sans jugement.",
            },
            "body-scan": {
                name: "Body scan",
                description:
                    "Balayer le corps avec l'attention pour relâcher les tensions.",
            },
            compassion: {
                name: "Compassion / Metta",
                description:
                    "Cultiver la bienveillance envers soi et les autres.",
            },

            wizard_timer_remainingLabel: "Temps restant",
            wizard_timer_pause: "Mettre en pause",
            wizard_timer_resume: "Reprendre",
            wizard_timer_reset: "Réinitialiser",
            wizard_timer_finished: "Séance terminée, bravo !"
        },

        last7_summary_sessions: "séances",
        last7_summary_minutes: "minutes",

        detail: {
            kpisTitle: "Indicateurs",
            trendTitle: "Tendance",
            historyTitle: "Historique",
            kpi: {
                weekMinutes: "Minutes (7 jours)",
                avg30: "Moyenne (30 jours)",
                streak: "Série",
                streakBestPrefix: "Meilleure série :",
                topType: "Type favori",
                na: "—",
            },
            trendMinutes30: "Minutes par session (30 derniers jours)",
            trendSma5: "Lissage (5)",
            insightsTitle: "Insights (30 jours)",
            insights: {
                activeDays: "Jours actifs",
                totalMinutes: "Temps total",
                bestDay: "Meilleur jour",
                top3Types: "Top 3 types",
                coverage: "Couverture",
                moodCoverage: "Humeur renseignée",
                moodCoverageShort: "Humeur",
            },
        },
    },

    publicWorld: {
        worldAlt: "Carte interactive MindfulSpace",
        sleepAlt: "Sommeil",
        exerciceAlt: "Exercice",
        meditationAlt: "Méditation",
        encodeSessionTitle: "Encoder une session",
        quickLogTitle: "Quick log",
        quickLogAriaSleep: "Quick log : sommeil",
        quickLogAriaMeditation: "Quick log : méditation",
        quickLogAriaExercise: "Quick log : exercice",
        quickLogToastSaved: "✅ Session enregistrée",
        worldStartTitle: "Mon monde",
        worldStartSubtitle: "Un aperçu, puis démarre quand tu veux.",
        worldStartCta: "Démarrer",
        worldPanelTitle: "MY WORLD",
        worldPanelCloseAria: "Fermer le panneau",
        worldPanelBackAria: "Revenir en arrière",
        worldPanelHomeAria: "Revenir à l’aperçu",
        startSessionTitle: "Démarrer une séance",
    },

    world: {
        domainDetail: {
            back: "Retour",
            subtitle: "Analyse de tes sessions : tendance, régularité, évolution…",
        },

        sections: {
            quickActionsTitle: "Actions rapides",
            quickActionsAria: "Section des actions rapides",
            domainsTitle: "Domaines",
            domainsAria: "Section de sélection des domaines",
        },

        overview: {
            chipWeekMinutes: "min cette semaine",
            chipWellbeing: "Bien-être :",

            todayTitle: "Aujourd’hui",
            quickLogCta: "Encoder",

            snapshotTitle: "Aperçu",

            todayExercisesTitle: "Exercices du jour",
            todayActionsTitle: "Actions du jour",

            encodeSessionCta: "Encoder une séance",
            encodeSessionSubtitle: "Ajouter rapidement une session (sommeil, méditation, exercice).",
            startSessionCta: "Démarrer une séance",
            startSessionSubtitle: "Lancer une séance guidée (méditation, exercice).",

            todayActionsHint: "Astuce : un petit encodage régulier fait progresser tes stats et tes badges.",

            viewAll: "Voir tous les badges",
            recentBadgesTitle: "Tes derniers badges",

            viewDetail: "Voir le détail",
            encode: "Encoder",

            sleepMainKpi: "Durée moyenne",
            sleepKpiA: "Durée :",
            sleepKpiB: "Qualité :",

            meditationMainKpi: "7 derniers jours",
            meditationKpiA: "Séances :",
            meditationKpiB: "Minutes :",

            exerciseMainKpi: "Cette semaine",
            exerciseKpiA: "Séances :",
            exerciseKpiB: "Objectifs :",

            programSubscribeCta: "M'abonner à un programme d'exercices",
            programSubscribeTitle: "Programmes d'exercices",
            programSubscribeSubtitle: "Choisis un programme pour planifier tes exercices et suivre ta progression.",
            programsCta: "M’abonner à un programme d’exercices",
            programsSubtitle: "Choisir un programme et recevoir des exercices planifiés.",

            chipStreak: "Streak :",
            metricsLoadError: "Impossible de charger les métriques.",
            sleepFootnoteEmpty: "Aucune nuit encodée cette semaine.",
            sleepFootnoteLastNight: "Dernière nuit :",
            meditationFootnoteEmpty: "Aucune humeur enregistrée.",
            meditationFootnoteMood: "Humeur moyenne :",
            exerciseFootnoteEmpty: "Aucune qualité encodée.",
            exerciseFootnoteQuality: "Qualité moyenne :",

            recentBadgesEmpty: "Aucun badge à afficher pour le moment.",

            topSummaryAria: "Résumé de vos données des 7 derniers jours",

            trendTitle: "Tendance",
            last7Days: "7 derniers jours",
            wellbeingBarLabel: "Bien-être",
            statusImprove: "À améliorer",
            statusStable: "Stable",
        },

        panel: {
            titles: {
                overview: "MY WORLD",
                badges: "Badges",
                quickLog: "Quick log",
                startSession: "Démarrer une séance",
            },
            backAria: "Retour",
            closeAria: "Fermer",
        },

        startSession: {
            title: "Démarrer une séance",
            hint: "Choisis un type de séance et lance-toi.",
        },

        programs: {
            title: "Programmes d’exercices",
            switchHint: "Plus tard : programmes méditation aussi.",
        },

        cards: {
            encodeSessionTitle: "Encoder une session",
        },

        actions: {
            quickLog: "Encodage rapide",
            viewAllBadges: "Voir tous mes badges",
        },

        domains: {
            sleep: "Sommeil",
            meditation: "Méditation",
            exercise: "Exercice",
        },

        toasts: {
            sessionSaved: "Session enregistrée",
            sessionSavedOffline: "Session enregistrée hors ligne",
        },
    },

    resourceDetailPage: {
        heroSubtitle: "Découvrez cette ressource de bien-être",
        backToList: "Retour aux ressources",
        loading: "Chargement de la ressource…",
        loadingTitle: "Chargement…",
        fallbackTitle: "Ressource",
        errorTitle: "Une erreur est survenue",
        errorGeneric: "Impossible de charger cette ressource pour le moment.",
        errorNetwork: "Problème de connexion réseau. Veuillez réessayer plus tard.",
        notFoundTitle: "Ressource introuvable",
        notFoundText: "Cette ressource n'existe pas ou n'est plus disponible.",
        readTimeSuffix: "min de lecture",
        premiumBadge: "Premium",
        featuredBadge: "À la une",
        noContent: "Le contenu de cette ressource n'est pas encore disponible.",
        forbiddenTitle: "Accès réservé",
        forbiddenText: "Cette ressource est réservée aux membres premium. Connectez-vous avec un compte premium pour y accéder.",
        backToListCTA: "Retour à la liste des ressources",
        authorLabel: "Par",
        publishedLabel: "Publié le",
        updatedLabel: "Modifié le",
        externalLinkTitle: "Ressource complémentaire",
        externalLinkDescription: "Un lien externe est associé à cette ressource pour approfondir le sujet",
        openExternalLink: "Consulter le lien"
    },

    notFoundPage: {
        heroTitle: "Page introuvable",
        heroSubtitle: "On dirait que cette page a décidé de méditer ailleurs.",
        heading: "Cette page semble s'être perdue en chemin.",
        bodyIntro:
            "L'adresse que vous avez saisie ne correspond à aucune page MindfulSpace. Le lien peut être erroné ou la page avoir été déplacée.",
        bodyBack:
            "Vous pouvez revenir à un espace familier en retournant à l'accueil.",
        backHome: "⬅ Retour à l'accueil",
        secondTitle: "Besoin d'un repère ?",
        secondText:
            "Prenez une respiration, puis utilisez le menu principal pour retrouver votre tableau de bord, vos séances ou vos objectifs.",
    },

    errorPage: {
        heroTitle: "Un imprévu est survenu",
        heroSubtitle: "Même MindfulSpace a parfois besoin d'un moment pour souffler.",
        heading: "Une petite turbulence technique s'est invitée.",
        body:
            "Une erreur s'est produite pendant le chargement de cette page. Vous pouvez essayer de réessayer ou revenir à l'accueil de MindfulSpace.",
        retry: "Réessayer",
        backHome: "⬅ Retour à l'accueil",
        secondTitle: "Rappel important",
        secondText:
            "MindfulSpace reste un projet académique fictif. Ne l'utilisez pas pour des situations d'urgence ou des besoins médicaux.",
    },

    adminHome: {
        title: "Espace administrateur",
        subtitle: "Section réservée à la gestion et au suivi du projet MindfulSpace.",
        placeholder: "Zone à implémenter : ajoutez ici les écrans d'administration (utilisateurs, contenus, paramètres…).",
    },

    coachHome: {
        title: "Espace coach",
        subtitle: "Section dédiée aux outils et fonctionnalités destinés aux coachs MindfulSpace.",
        placeholder: "Zone à implémenter : ajoutez ici les écrans liés au rôle coach (accompagnement, suivi, communication…).",
    },


    /*
     * Components
     */
    footer: {
        deployMessage: "Déployé avec ❤️ et sérénité grâce à CI/CD GitLab 🌿",
        cookiesLink: "Cookies",
        cookiePolicy: "Politique de cookies",
    },

    langSwitcher: {
        label: "Langue",
        switchTo: "Passer en",
    },

    globalNotice: {
        message:
            "Ceci est une application de projet scolaire. Toutes les données, contenus et fonctionnalités sont fictifs.",
    },

    moodPicker: {
        ariaLabel: "Sélection de l'humeur",
        closed: "Difficile",
        low: "Pas top",
        medium: "Correct",
        good: "Bien",
        open: "Excellent",

        labels: {
            very_bad: "Très mal",
            bad: "Mal",
            neutral: "Neutre",
            good: "Bien",
            very_good: "Très bien",
        },
    },

    cookieBanner: {
        title: "Cookies & bien-être 🍪",
        description:
            "On utilise des cookies essentiels pour faire fonctionner le site. Avec ton accord, on utilise aussi des cookies pour analyser l'usage et personnaliser ton expérience.",
        acceptAll: "OK pour moi",
        choose: "Je choisis",
        hint: "Tu peux modifier tes choix à tout moment dans « Cookies ».",
    },

    cookieModal: {
        title: "Préférences cookies",

        analyticsTitle: "Cookies analytiques",
        analyticsDescription:
            "Nous aident à comprendre comment l'application est utilisée.",

        personalizationTitle: "Personnalisation",
        personalizationDescription:
            "Permet de personnaliser le contenu affiché pour toi.",

        essentialTitle: "Cookies essentiels",
        essentialDescription:
            "Nécessaires au fonctionnement de l'application.",

        cancel: "Annuler",
        save: "Enregistrer",
    },

    quickLogCard: {
        title: "Quick Log",
        subtitle: "Enregistre rapidement tes indicateurs de bien-être du jour.",

        loggingFor: "Encodage pour",
        todaySuffix: "aujourd'hui",
        yesterdaySuffix: "hier",

        today: "Aujourd'hui",
        yesterday: "Hier",
        chooseAnotherDate: "Choisir une autre date",

        valueLabel: "Valeur",
        qualityLabel: "Qualité",

        saving: "Enregistrement…",
        submit: "Enregistrer",

        success: "Séance enregistrée avec succès.",
        error: "Erreur lors de l'enregistrement de la séance.",
    },

    /*
     * Authentification
     */
    auth: {
        // Page de connexion
        loginTitle: "Bon retour",
        loginSubtitle: "Connectez-vous à votre compte MindfulSpace",
        emailLabel: "Email",
        emailPlaceholder: "votre@email.com",
        passwordLabel: "Mot de passe",
        passwordPlaceholder: "••••••••",
        forgotPassword: "Mot de passe oublié ?",
        signInButton: "Se connecter",
        orContinueWith: "ou continuer avec",
        noAccount: "Pas encore de compte ?",
        signUpLink: "S'inscrire",
        invalidCredentials: "Email ou mot de passe invalide",

        // Page d'inscription
        registerTitle: "Créer un compte",
        registerSubtitle: "Commencez votre voyage vers la pleine conscience",
        fullNameLabel: "Nom complet",
        fullNamePlaceholder: "Jean Dupont",
        confirmPasswordLabel: "Confirmer le mot de passe",
        passwordRequirements: "Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial.",
        createAccountButton: "Créer un compte",
        alreadyHaveAccount: "Vous avez déjà un compte ?",
        signInLink: "Se connecter",

        // Succès de l'inscription
        checkEmailTitle: "Vérifiez votre email",
        checkEmailSubtitle: "Nous vous avons envoyé un lien de vérification",
        checkEmailMessage: "Veuillez consulter votre email {email} et cliquer sur le lien de vérification pour activer votre compte.",
        checkEmailNote: "Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou contactez le support.",
        backToLogin: "Retour à la connexion",

        // Erreurs de validation
        nameMinLength: "Le nom doit contenir au moins 2 caractères",
        passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
        passwordUppercase: "Le mot de passe doit contenir une majuscule",
        passwordLowercase: "Le mot de passe doit contenir une minuscule",
        passwordNumber: "Le mot de passe doit contenir un chiffre",
        passwordSpecial: "Le mot de passe doit contenir un caractère spécial (@$!%*?&)",
        passwordsNoMatch: "Les mots de passe ne correspondent pas",
        registrationFailed: "L'inscription a échoué",

        // Callback OAuth
        signingIn: "Connexion en cours...",
        authenticationFailed: "Échec de l'authentification",
        redirectingToLogin: "Redirection vers la connexion...",

        // Boutons OAuth
        continueWithGoogle: "Continuer avec Google",
        continueWithGithub: "Continuer avec GitHub",

        // Boutons d'authentification
        signIn: "Se connecter",
        signUp: "S'inscrire",

        // Menu utilisateur
        myWorld: "Mon monde",
        profileSettings: "Paramètres du profil",
        adminPanel: "Panneau administrateur",
        signOut: "Se déconnecter",

        // Vérification d'email
        verifyEmailLoading: "Vérification...",
        verifyEmailSuccess: "Email vérifié !",
        verifyEmailFailed: "Échec de la vérification",
        verifyEmailInvalidLink: "Lien de vérification invalide",
        verifyEmailSuccessMessage: "Email vérifié avec succès !",
        verifyEmailVerificationFailed: "Échec de la vérification",
        verifyEmailCanSignIn: "Vous pouvez maintenant vous connecter à votre compte.",
        verifyEmailLinkExpired: "Le lien a peut-être expiré ou est invalide.",
        verifyEmailGoToLogin: "Aller à la connexion",
        verifyEmailRegisterAgain: "S'inscrire à nouveau",

        // Mot de passe oublié
        forgotPasswordTitle: "Mot de passe oublié ?",
        forgotPasswordSubtitle: "Entrez votre email pour recevoir les instructions",
        forgotPasswordSendButton: "Envoyer le lien de réinitialisation",
        forgotPasswordCheckEmail: "Vérifiez votre email",
        forgotPasswordInstructionsSent: "Instructions de réinitialisation envoyées",
        forgotPasswordCheckEmailMessage: "Si un compte existe avec {email}, vous recevrez les instructions de réinitialisation du mot de passe.",
        forgotPasswordCheckSpam: "Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou réessayez.",
        forgotPasswordTryAnother: "Essayer un autre email",
        forgotPasswordFailedToSend: "Échec de l'envoi de l'email de réinitialisation",

        // Réinitialisation du mot de passe
        resetPasswordTitle: "Réinitialiser le mot de passe",
        resetPasswordSubtitle: "Entrez votre nouveau mot de passe",
        resetPasswordNewPasswordLabel: "Nouveau mot de passe",
        resetPasswordConfirmPasswordLabel: "Confirmer le nouveau mot de passe",
        resetPasswordButton: "Réinitialiser le mot de passe",
        resetPasswordInvalidLink: "Lien invalide",
        resetPasswordLinkExpired: "Le lien de réinitialisation est invalide ou a expiré.",
        resetPasswordRequestNew: "Demander un nouveau lien",
        resetPasswordComplete: "Réinitialisation terminée",
        resetPasswordSuccess: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        resetPasswordFailed: "Échec de la réinitialisation du mot de passe",

        goToProfile: "Aller à mon profil",
    },

    profile: {
        // Page title
        pageTitle: "Paramètres du profil",
        pageSubtitle: "Gérez vos informations personnelles et paramètres de sécurité",

        // Account Information Section
        accountInfoTitle: "Informations du compte",
        displayNameLabel: "Nom d'affichage",
        displayNamePlaceholder: "Votre nom",
        emailLabel: "Adresse email",
        emailVerifiedBadge: "Vérifié",
        emailNotVerifiedBadge: "Non vérifié",
        accountCreatedLabel: "Compte créé le",
        accountStatusLabel: "Statut du compte",
        accountStatusActive: "Actif",
        accountStatusSuspended: "Suspendu",
        updateProfileButton: "Mettre à jour le profil",
        profileUpdatedSuccess: "Profil mis à jour avec succès",

        // Security Settings Section
        securityTitle: "Sécurité",
        changePasswordTitle: "Changer le mot de passe",
        currentPasswordLabel: "Mot de passe actuel",
        newPasswordLabel: "Nouveau mot de passe",
        changePasswordButton: "Changer le mot de passe",
        passwordChangedSuccess: "Mot de passe changé avec succès",
        noPasswordSet: "Compte OAuth uniquement - aucun mot de passe défini",

        // Connected Accounts
        connectedAccountsTitle: "Comptes connectés",
        connectedSince: "Connecté depuis",
        unlinkButton: "Déconnecter",
        noConnectedAccounts: "Aucun compte OAuth connecté",
        unlinkConfirm: "Êtes-vous sûr de vouloir déconnecter ce compte ?",
        unlinkSuccess: "Compte déconnecté avec succès",
        unlinkError: "Impossible de déconnecter le seul moyen d'authentification",

        // Active Sessions
        activeSessionsTitle: "Sessions actives",
        currentSessionBadge: "Session actuelle",
        deviceLabel: "Appareil",
        ipAddressLabel: "Adresse IP",
        lastActiveLabel: "Dernière activité",
        revokeSessionButton: "Révoquer",
        revokeAllOtherButton: "Révoquer toutes les autres sessions",
        noActiveSessions: "Aucune session active",
        revokeSessionConfirm: "Êtes-vous sûr de vouloir révoquer cette session ?",
        revokeAllConfirm: "Êtes-vous sûr de vouloir révoquer toutes les autres sessions ?",
        sessionRevokedSuccess: "Session révoquée avec succès",
        allSessionsRevokedSuccess: "Toutes les autres sessions ont été révoquées",

        // Data Privacy
        dataPrivacyTitle: "Confidentialité des données",
        exportDataButton: "Télécharger mes données",
        exportDataDescription: "Téléchargez toutes vos données personnelles au format JSON (RGPD)",
        exportDataSuccess: "Vos données ont été téléchargées",
        deleteAccountButton: "Supprimer mon compte",
        deleteAccountDescription: "Suppression permanente de votre compte et de toutes vos données",
        deleteAccountWarning: "Cette action est irréversible. Toutes vos données seront supprimées définitivement.",
        deleteAccountConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ?",
        deleteAccountPasswordLabel: "Entrez votre mot de passe pour confirmer",
        deleteAccountConfirmButton: "Oui, supprimer mon compte",
        deleteAccountCancelButton: "Annuler",
        accountDeletedSuccess: "Votre compte a été supprimé",

        // Subscription & Roles
        subscriptionTitle: "Abonnement",
        currentSubscriptionLabel: "Abonnement actuel",
        subscriptionStandard: "Standard",
        subscriptionPremium: "Premium",
        subscriptionCoach: "Coach",
        upgradeToPremiumButton: "Passer à Premium",
        upgradeToPremiumDescription: "Accédez à des fonctionnalités exclusives et du contenu premium",
        premiumFeatures: "Fonctionnalités Premium",
        premiumFeature1: "Programmes de méditation avancés",
        premiumFeature2: "Plans d'entraînement personnalisés",
        premiumFeature3: "Analyses détaillées du sommeil",
        premiumFeature4: "Support prioritaire",

        // Errors
        errorLoadingProfile: "Erreur lors du chargement du profil",
        errorUpdatingProfile: "Erreur lors de la mise à jour du profil",
        errorChangingPassword: "Erreur lors du changement de mot de passe",
        errorRevokingSession: "Erreur lors de la révocation de la session",
        errorUnlinkingAccount: "Erreur lors de la déconnexion du compte",
        errorDeletingAccount: "Erreur lors de la suppression du compte",
    },

    badges: {
        latestBadgesTitle: "Tes derniers badges",
        viewAllBadgesLink: "Voir tous mes badges",

        toastUnlockedTitle: "Nouveau badge débloqué",
        toastUnlockedSubtitle: "Tu viens de débloquer un badge !",

        allBadgesTitle: "Mes badges",
        loading: "Chargement…",

        badgesCount: "{count} badges obtenus",
        noBadgesYet: "Aucun badge pour le moment.",
        noBadgesYetLong:
            "Continue les activités (sommeil, méditation, exercice) pour débloquer des badges.",
        earnedOnLabel: "Obtenu le",
        recentlyEarnedTitle: "Derniers badges obtenus",

        meditation: {
            first: {
                title: "Première séance de méditation",
                description: "Tu as terminé ta toute première séance de méditation.",
            },
            five: {
                title: "5 séances de méditation complétées",
                description: "Tu as complété 5 séances. Continue comme ça !",
            },
            streak3: {
                title: "3-jour de meditation",
                description: "Tu as médité 3 jours d'affilée !",
            },
        },

        exercice: {
            first: {
                title: "Première séance d'exercice",
                description: "Tu as enregistré ta première séance d'exercice.",
            },
            streak3: {
                title: "3-jour d'exercices",
                description: "Tu as fait des exercices 3 jours d'affilée !",
            },
        },

        sleep: {
            first: {
                title: "Première nuit de sommeil suivie",
                description: "Tu as encodé ta première nuit de sommeil.",
            },
        },

        generic: {
            firstSession: {
                title: "Première session MindfulSpace",
                description: "Bienvenue ! Tu as commencé à utiliser MindfulSpace.",
            },
        },

        quickLogSaved: {
            title: "Session enregistrée",
            description: "Bravo pour cette nouvelle étape !",
        },
    },

    /*
     * Resources Management
     */
    resourcesManagement: {
        title: "Gestion des ressources",
        loading: "Chargement...",
        myResources: "Mes ressources",
        allResources: "Toutes les ressources",
        createResource: "Créer une ressource",
        createResourceDescription: "Créez une nouvelle ressource avec support de traduction automatique",
        editResource: "Modifier la ressource",
        deleteResource: "Supprimer la ressource",

        // List view
        noResources: "Aucune ressource",
        noResourcesDescription: "Vous n'avez pas encore créé de ressources.",
        searchPlaceholder: "Rechercher des ressources...",
        filterByCategory: "Filtrer par catégorie",
        allCategories: "Toutes les catégories",

        // Resource types
        types: {
            ARTICLE: "Article",
            VIDEO: "Vidéo",
            GUIDE: "Guide",
            MEDITATION_PROGRAM: "Programme de méditation",
            EXERCICE_PROGRAM: "Programme d'exercice",
        },

        // Form labels
        form: {
            title: "Titre",
            titlePlaceholder: "Titre de la ressource",
            titleHelper: "Le titre apparaîtra dans la liste des ressources",

            slug: "Slug (URL)",
            slugPlaceholder: "titre-de-la-ressource",
            slugHelper: "URL conviviale (lettres minuscules, chiffres et tirets uniquement)",
            generateSlug: "Générer automatiquement",

            summary: "Résumé",
            summaryPlaceholder: "Courte description de la ressource",
            summaryHelper: "Apparaît dans les cartes de ressources (max 500 caractères)",

            content: "Contenu",
            contentPlaceholder: "Contenu complet de la ressource (Markdown supporté)",
            contentHelper: "Le contenu complet de votre ressource",

            type: "Type de ressource",
            typeHelper: "Choisissez le type de contenu",

            category: "Catégorie",
            categoryHelper: "Catégorie principale de la ressource",
            selectCategory: "Sélectionner une catégorie",

            tags: "Tags",
            tagsHelper: "Sélectionnez des tags pertinents (optionnel)",
            selectTags: "Sélectionner des tags",

            isPremium: "Contenu premium",
            isPremiumHelper: "Réserver aux utilisateurs premium",

            isFeatured: "Mis en avant",
            isFeaturedHelper: "Afficher sur la page d'accueil (admin uniquement)",

            authorName: "Nom de l'auteur",
            authorNamePlaceholder: "Dr. Sarah Johnson",
            authorNameHelper: "Nom affiché comme auteur (optionnel)",

            readTimeMin: "Temps de lecture (min)",
            readTimeMinPlaceholder: "8",
            readTimeMinHelper: "Estimation du temps de lecture en minutes",
            calculateReadTime: "Calculer automatiquement",

            externalUrl: "URL externe",
            externalUrlPlaceholder: "https://youtu.be/...",
            externalUrlHelper: "Lien vers une vidéo YouTube ou un article externe (optionnel)",

            meditationProgram: "Programme de méditation",
            meditationProgramHelper: "Lier à un programme de méditation existant (optionnel)",
            selectProgram: "Sélectionner un programme",

            sourceLocale: {
                label: "Langue source",
                helper: "Langue dans laquelle vous rédigez le contenu",
            },

            metadataSection: "Métadonnées de la ressource",
            readOnly: "Lecture seule",
        },

        // Wizard
        wizard: {
            translating: {
                title: "Traduction en cours...",
                description: "Notre IA traduit votre ressource dans les autres langues. Cela peut prendre quelques secondes.",
            },
            review: {
                instructions: "Vérifiez et modifiez les traductions générées automatiquement. Vous pouvez ajuster n'importe quel champ avant de sauvegarder.",
                sourceLanguage: "Langue source",
                translation: "Traduction",
            },
        },

        // Actions
        actions: {
            save: "Enregistrer",
            cancel: "Annuler",
            edit: "Modifier",
            delete: "Supprimer",
            create: "Créer",
            back: "Retour",
            viewPublic: "Voir la version publique",
            translateAndReview: "Traduire et réviser",
            translating: "Traduction en cours...",
            saving: "Enregistrement...",
            saveAll: "Tout enregistrer",
        },

        // Success messages
        success: {
            created: "Ressource créée avec succès",
            updated: "Ressource mise à jour avec succès",
            deleted: "Ressource supprimée avec succès",
        },

        // Error messages
        errors: {
            loadFailed: "Erreur lors du chargement des ressources",
            createFailed: "Erreur lors de la création de la ressource",
            updateFailed: "Erreur lors de la mise à jour de la ressource",
            deleteFailed: "Erreur lors de la suppression de la ressource",
            notFound: "Ressource introuvable",
            unauthorized: "Vous n'avez pas la permission de modifier cette ressource",
            slugExists: "Ce slug est déjà utilisé",
            invalidSlug: "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets",
            requiredField: "Ce champ est requis",
            minLength: "Trop court",
            maxLength: "Trop long",
            invalidUrl: "URL invalide",
            translationFailed: "Erreur lors de la traduction automatique",
        },

        // Delete confirmation
        deleteConfirm: {
            title: "Supprimer la ressource ?",
            message: "Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible.",
            warningLinked: "Attention : Cette ressource est liée à un programme de méditation. Seuls les administrateurs peuvent la supprimer.",
            confirm: "Oui, supprimer",
            cancel: "Non, annuler",
        },

        // Resource card
        card: {
            premium: "Premium",
            featured: "Mis en avant",
            readTime: "{{minutes}} min de lecture",
            author: "Par {{author}}",
            createdAt: "Créé le {{date}}",
            updatedAt: "Mis à jour le {{date}}",
            views: "{{count}} vue",
            views_plural: "{{count}} vues",
        },

        // Filters
        filters: {
            all: "Toutes",
            premium: "Premium uniquement",
            free: "Gratuites uniquement",
            featured: "Mises en avant",
            myResources: "Mes ressources",
        },

        // Stats
        stats: {
            total: "Total",
            premium: "Premium",
            free: "Gratuites",
            featured: "Mises en avant",
        },
    },

    taxonomyManagement: {
        title: "Gestion de la taxonomie",
        subtitle: "Gérez les catégories et les tags pour organiser vos ressources",

        // Tabs
        tabs: {
            categories: "Catégories",
            tags: "Tags",
        },

        // Categories section
        categories: {
            title: "Catégories de ressources",
            description: "Les catégories organisent vos ressources en grands thèmes (Sommeil, Stress, etc.)",
            createNew: "Nouvelle catégorie",
            editCategory: "Modifier la catégorie",
            deleteCategory: "Supprimer la catégorie",
            noCategories: "Aucune catégorie",
            noCategoriesDescription: "Commencez par créer votre première catégorie",
            resourceCount: "{{count}} ressource",
            resourceCount_plural: "{{count}} ressources",

            form: {
                name: "Nom de la catégorie",
                namePlaceholder: "Ex: Sommeil, Stress, Méditation",
                nameHelper: "Nom affiché aux utilisateurs",

                slug: "Slug (URL)",
                slugPlaceholder: "sommeil",
                slugHelper: "Identifiant unique pour les URLs (lettres minuscules, chiffres et tirets uniquement)",

                iconEmoji: "Icône (emoji)",
                iconEmojiPlaceholder: "😴",
                iconEmojiHelper: "Emoji affiché dans l'interface (optionnel)",
            },

            deleteConfirm: {
                title: "Supprimer la catégorie ?",
                message: "Êtes-vous sûr de vouloir supprimer cette catégorie ?",
                warningHasResources: "Impossible de supprimer : {{count}} ressource utilise cette catégorie. Réassignez ou supprimez ces ressources d'abord.",
                warningHasResources_plural: "Impossible de supprimer : {{count}} ressources utilisent cette catégorie. Réassignez ou supprimez ces ressources d'abord.",
                confirm: "Oui, supprimer",
                cancel: "Annuler",
            },
        },

        // Tags section
        tags: {
            title: "Tags de ressources",
            description: "Les tags permettent un étiquetage plus fin du contenu (stress, sommeil, relaxation, etc.)",
            createNew: "Nouveau tag",
            editTag: "Modifier le tag",
            deleteTag: "Supprimer le tag",
            noTags: "Aucun tag",
            noTagsDescription: "Commencez par créer votre premier tag",
            resourceCount: "{{count}} ressource",
            resourceCount_plural: "{{count}} ressources",

            form: {
                name: "Nom du tag",
                namePlaceholder: "Ex: stress, sommeil, relaxation",
                nameHelper: "Nom affiché aux utilisateurs",

                slug: "Slug (URL)",
                slugPlaceholder: "stress",
                slugHelper: "Identifiant unique pour les URLs (lettres minuscules, chiffres et tirets uniquement)",
            },

            deleteConfirm: {
                title: "Supprimer le tag ?",
                message: "Êtes-vous sûr de vouloir supprimer ce tag ? Il sera retiré de toutes les ressources qui l'utilisent.",
                confirm: "Oui, supprimer",
                cancel: "Annuler",
            },
        },

        // Actions
        actions: {
            create: "Créer",
            save: "Enregistrer",
            cancel: "Annuler",
            edit: "Modifier",
            delete: "Supprimer",
            close: "Fermer",
        },

        // Success messages
        success: {
            categoryCreated: "Catégorie créée avec succès",
            categoryUpdated: "Catégorie mise à jour avec succès",
            categoryDeleted: "Catégorie supprimée avec succès",
            tagCreated: "Tag créé avec succès",
            tagUpdated: "Tag mis à jour avec succès",
            tagDeleted: "Tag supprimé avec succès",
            translationSaved: "Traduction enregistrée avec succès",
            translationDeleted: "Traduction supprimée avec succès",
            translationRegenerated: "Traduction régénérée avec succès",
        },

        // Error messages
        errors: {
            categoryCreateFailed: "Erreur lors de la création de la catégorie",
            categoryUpdateFailed: "Erreur lors de la mise à jour de la catégorie",
            categoryDeleteFailed: "Erreur lors de la suppression de la catégorie",
            tagCreateFailed: "Erreur lors de la création du tag",
            tagUpdateFailed: "Erreur lors de la mise à jour du tag",
            tagDeleteFailed: "Erreur lors de la suppression du tag",
            loadFailed: "Erreur lors du chargement",
            slugExists: "Ce slug est déjà utilisé",
            invalidSlug: "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets",
            requiredField: "Ce champ est requis",
            minLength: "Trop court (minimum {{min}} caractères)",
            maxLength: "Trop long (maximum {{max}} caractères)",
            translationLoadFailed: "Échec du chargement des traductions",
            translationGenerateFailed: "Échec de la génération de la traduction",
            translationSaveFailed: "Échec de l'enregistrement de la traduction",
            translationDeleteFailed: "Échec de la suppression de la traduction",
            translationRegenerateFailed: "Échec de la régénération de la traduction",
            translateTextFailed: "Échec de la traduction du texte",
        },
    }

}; // optionnel, juste pour garder un "shape"

export type Messages = typeof fr;
export default fr;