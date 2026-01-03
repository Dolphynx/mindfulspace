import type { Messages } from "./fr";

const en: Messages = {
    /*
     * Common
     */
    common: {
        appName: "MindfulSpace",
    },

    metadataLayout: {
        defaultTitle: "MindfulSpace – Take care of your mind",
        description:
            "MindfulSpace helps you track your well-being (sleep, breathing, meditation) and build a calmer daily routine. Academic project by HELMo.",
    },

    /*
     * Navigation
     */
    nav: {
        resources: "Resources",
        coach: "Become a coach",
        contact: "Contact",
        clientSpace: "Client area",
        breathing: "Breathing",
        dashboard: "Dashboard",
        objectives: "Goals",
        becomeCoach: "Become a coach",
        world: "My world",
        world2: "My wellness map",
        badges: "My badges",
        meditation: "Meditation",
        exercise: "Exercises",
        sleep: "Sleep"
    },

    navbar: {
        resources: "Resources",
        becomecoach: "Become a coach",
        contact: "Contact",
        clientSpace: "Client space",
        breathing: "Breathing",
        dashboard: "Dashboard",
        objectives: "Goals",
        mobileToggle: "Open menu",
        world: "My world",
        world2: "My wellness map",
        badges: "My badges",
        meditation: "Meditation",
        exercise: "Exercises",
        sleep: "Sleep"
    },

    navbarCoach: {
        emptyPlaceholder: "Coach menu",
        resources: "My resources",
        backToApp: "Back to app",
    },

    navbarAdmin: {
        emptyPlaceholder: "Admin menu",
        resources: "Resource management",
        sessions: "Meditation sessions",
        backToApp: "Back to app",
    },

    legalNoticePage: {
        title: "Mentions légales",

        intro:
            "La présente page a pour objectif de fournir les informations légales relatives au projet MindfulSpace, développé dans un cadre strictement académique.",

        section1Title: "Éditeur du site",
        section1Text:
            "MindfulSpace est un projet pédagogique réalisé dans le cadre d’un cursus académique. Il ne constitue ni un service commercial, ni une entreprise réelle.",

        section2Title: "Hébergement",
        section2Text:
            "Despite its educational context, the application is hosted on a professional technical infrastructure. We place importance on availability and performance; however, these cannot be guaranteed in this educational setting, as the server infrastructure is not a critical aspect of the evaluation.",

        section3Title: "Responsabilité",
        section3Text:
            "Les contenus proposés sur ce site le sont à titre informatif et éducatif. Les auteurs ne sauraient être tenus responsables de l’utilisation faite des informations ou fonctionnalités proposées.",

        section4Title: "Propriété intellectuelle",
        section4Text:
            "L’ensemble des contenus présents sur ce site (textes, visuels, interfaces et code source) est destiné à un usage pédagogique. Toute reproduction, diffusion ou réutilisation en dehors de ce cadre est interdite sans autorisation.",

        section5Title: "Données personnelles",
        section5Text:
            "Les données éventuellement manipulées dans l’application le sont exclusivement à des fins de démonstration ou de test. Aucune donnée réelle à caractère personnel n’est exploitée ni conservée.",

        section6Title: "Contact",
        section6Text:
            "Pour toute question relative au projet, à son contenu ou à son fonctionnement, vous pouvez contacter l’équipe en charge du développement à l’adresse suivante :",
    },

    privacyPolicyPage: {
        title: "Privacy Policy",

        intro:
            "This privacy policy aims to inform users about how data is handled within the MindfulSpace project, developed in a strictly academic context.",

        section1Title: "Scope",
        section1Text:
            "This policy applies to all features of the MindfulSpace application and concerns only data handled for demonstration, testing, or educational purposes.",

        section2Title: "Collected data",
        section2Text:
            "The data potentially handled within the application is limited. It may include account information (email address, user preferences) as well as data related to well-being activities such as meditation sessions or habit tracking.",

        section3Title: "Purpose of data processing",
        section3Text:
            "Data is used exclusively for educational, technical, and demonstration purposes. It is intended to illustrate the operation of a full-stack web application and is not subject to any commercial use.",

        section4Title: "Data retention period",
        section4Text:
            "Data is retained only for the duration necessary for educational activities and testing phases. It may be deleted, reset, or modified at any time without prior notice.",

        section5Title: "Data sharing",
        section5Text:
            "No data is sold, transferred, or shared with third parties for commercial purposes. Any technical integrations used within the application are intended solely to simulate functionalities.",

        section6Title: "User rights",
        section6Text:
            "Within the scope of the project, users may request access to, modification of, or deletion of the data associated with their account, insofar as such data exists for demonstration purposes.",

        section7Title: "Contact",
        section7Text:
            "For any questions regarding data handling or the operation of the application, you may contact the project team at the following address:",
    },

    notificationsBell: {
        ariaLabel: "Notifications",
        title: "Notifications",
        markAllRead: "Mark all as read",
        empty: "No notifications.",
        detailsInProfile: "Details in your profile",
        goToProfile: "Go to profile",
        close: "Close",

        target: {
            premium: "Premium",
            coach: "Coach",
        },

        decision: {
            approved: "approved",
            rejected: "rejected",
            updated: "updated",
        },

        format: {
            line: "{target}{tier}: {decision}",
            tier: " ({tier})",
        },
    },

    adminDashboard: {
        title: "Admin Panel",
        tabs: {
            dashboard: "Dashboard",
            resources: "Resources",
            taxonomy: "Taxonomy",
            profile: "My Profile",
            subscriptions: "Subscription Requests",
        },
        backToApp: "Back to App",
        logout: "Log Out",
        welcome: "Welcome to the MindfulSpace administration panel",
        stats: {
            totalUsers: "Total Users",
            resources: "Resources",
            sessions: "Sessions",
        },
        errors: {
            loadStatsFailed: "Failed to load statistics",
        },
        subscriptionRequests: {
            title: "Subscription Requests",
            subtitle: "Manage Premium and Coach upgrade requests",
            pending: "pending",
            loading: "Loading...",
            noRequests: "No requests found",
            unknownUser: "Unknown user",
            unknownAdmin: "Unknown admin",
            viewDetails: "View details",

            // Filters
            filters: {
                all: "All",
                pending: "Pending",
                approved: "Approved",
                rejected: "Rejected",
                cancelled: "Cancelled",
            },

            // Table headers
            table: {
                user: "User",
                type: "Type",
                tier: "Tier",
                date: "Date",
                status: "Status",
                actions: "Actions",
            },

            // Review modal
            reviewTitle: "Review Request",
            userInfo: "User Information",
            name: "Name",
            email: "Email",
            requestDetails: "Request Details",
            requestType: "Request Type",
            tier: "Tier",
            submittedOn: "Submitted on",
            currentStatus: "Current Status",
            motivation: "Motivation",
            experience: "Experience and Qualifications",
            previousReview: "Previous Review",
            reviewedBy: "Reviewed by",
            reviewedOn: "Reviewed on",
            adminNotes: "Admin Notes",
            adminNotesPlaceholder: "Add notes about this decision (optional)...",
            close: "Close",
            approve: "Approve",
            reject: "Reject",
            processing: "Processing...",
            errorReviewing: "Error reviewing request",
        },
    },

    /*
     * Pages
     */
    publicHome: {
        heroTitle: "MindfulSpace",
        heroSubtitle: "Take care of your mental well-being, one step at a time",

        welcomeTitle: "Welcome to MindfulSpace",
        welcomeParagraph1: "MindfulSpace supports you daily to cultivate calm, balance, and mindfulness.",
        welcomeParagraph2: "Explore resources, track your habits, and progress at your own pace.",

        discoverTitle: "Discover",
        discoverResources: "Well-being resources",
        discoverCoachs: "Our coaches",
        discoverContact: "Contact us",

        ctaTitle: "Your personal space",
        ctaDescription: "Sign in to access your world, track your sessions, and view your progress.",

        loginButton: "Sign in",
        accessWorldButton: "Access my world",
        disclaimer: "Some features require an account.",

        mindfulTitle: "Why MindfulSpace?",
        mindfulPoint1: "Guided breathing and meditation exercises",
        mindfulPoint2: "Simple and visual well-being tracking",
        mindfulPoint3: "A personal space designed for serenity",

        registerButton: "Sign up",

        featureMeditationTitle: "Guided meditations",
        featureMeditationText: "Access structured sessions (various durations and themes) to refocus, release pressure, and build a routine.",
        featureMeditationLink: "Explore resources",

        featureTrackingTitle: "Track your progress",
        featureTrackingText: "See your habits and sessions over time to understand what truly supports your day-to-day well-being.",
        featureTrackingNote: "Tracking data is available after signing in.",

        featureResourcesTitle: "Resources and guidance",
        featureResourcesText: "Articles and curated content to better understand stress, mindfulness, and practical well-being routines.",
        featureResourcesLink: "Contact us",
    },

    contactPage: {
        heroTitle: "Contact",
        heroSubtitle: "Any questions about MindfulSpace?",

        teamTitle: "MindfulSpace team",
        projectDescription:
            "MindfulSpace is a fictional academic project developed as part of an application development curriculum.",
        projectWarning:
            "No information provided through this platform is read, processed or monitored by a healthcare professional.",

        contactEmailLabel: "Email:",
        contactAddressLabel: "Address:",
        contactPhoneLabel: "Phone:",

        emergencyTitle: "Need urgent help?",
        emergencyDescription:
            "This application is not a medical service. If you are in emotional distress or in crisis, please contact emergency services or a professional helpline immediately.",
    },

    cookiesPolicyPage: {
        title: "Cookie Policy",
        intro:
            "This page explains how MindfulSpace uses cookies and similar technologies. This project is a fictional academic exercise and does not collect data for commercial purposes.",

        section1Title: "1. What is a cookie?",
        section1Text:
            "A cookie is a small text file stored on your device when visiting a website. It allows the site to recognize your browser or remember certain information.",

        section2Title: "2. Types of cookies used",
        section2EssentialTitle: "Essential:",
        section2EssentialDesc: "necessary for the proper functioning of the site (e.g., consent storage).",
        section2AnalyticsTitle: "Analytics:",
        section2AnalyticsDesc: "help improve the user experience through anonymized statistics. These are disabled by default.",
        section2PersonalizationTitle: "Personalization:",
        section2PersonalizationDesc: "adapts the displayed content. Disabled by default.",

        section3Title: "3. Your consent",
        section3Text:
            "On your first visit, a banner allows you to accept or refuse non-essential cookies. You can modify your choice at any time via the \"Cookie preferences\" link at the bottom of the page.",

        section4Title: "4. Personal data",
        section4Text:
            "MindfulSpace does not collect, store, or share any personal data. All information displayed in the app is fictional and is not transmitted to third parties.",

        section5Title: "5. Contact",
        section5Text: "For any questions regarding this policy, you can contact us at:",
    },

    offlinePage: {
        heroTitle: "You are offline",
        heroSubtitle: "Some MindfulSpace features are not available without an internet connection.",

        card1Title: "Unable to reach the server",
        card1Intro:
            "MindfulSpace cannot connect right now. This may be due to a loss of internet connection or a temporary network issue.",
        card1Item1: "Check that your Wi-Fi or mobile data are turned on.",
        card1Item2:
            "If possible, move closer to your router or to an area with better coverage.",
        card1Item3: "Try reloading the page once your connection is back.",
        card1Note:
            "If you had already opened some pages, they may still be visible even while offline.",

        card2Title: "Back to MindfulSpace",
        card2Text:
            "As soon as your connection is restored, you can return to the main dashboard to continue tracking your wellbeing habits.",
        card2Button: "Back to dashboard",
    },

    formationPage: {
        heroTitle: "Become a Wellness Coach",
        heroSubtitle: "Transform lives — including your own — with our certified MindfulSpace program.",

        whyTitle: "Why become a coach?",
        why1Title: "Build a community",
        why1Text: "Support people seeking wellbeing and create a positive, caring space.",
        why2Title: "Grow your practice",
        why2Text: "Expand your impact and offer structured guidance using our tools.",
        why3Title: "Make a difference",
        why3Text: "Help others reach their mental health and balance goals.",
        why4Title: "Gain recognition",
        why4Text: "Earn a certification and strengthen your professional credibility.",

        programTitle: "Complete training program",
        programSubtitle: "A structured 12-week course designed with wellbeing experts.",

        program1Title: "Foundations of wellness coaching",
        program1Duration: "4 weeks",
        program1Item1: "Principles of coaching",
        program1Item2: "Communication skills",
        program1Item3: "Goal-setting techniques",

        program2Title: "Nutrition & Lifestyle habits",
        program2Duration: "3 weeks",
        program2Item1: "Nutrition basics",
        program2Item2: "Lifestyle-based interventions",
        program2Item3: "Building sustainable habits",

        program3Title: "Mental health & Mindfulness",
        program3Duration: "3 weeks",
        program3Item1: "Stress management",
        program3Item2: "Meditation techniques",
        program3Item3: "Emotional intelligence",

        program4Title: "Professional practice management",
        program4Duration: "2 weeks",
        program4Item1: "Client management",
        program4Item2: "Business fundamentals",
        program4Item3: "Ethics & professional boundaries",

        pricingTitle: "Choose your pathway",

        pricing1Title: "Foundation",
        pricing1Price: "€499",
        pricing1F1: "Full program",
        pricing1F2: "Self-paced learning",
        pricing1F3: "Digital certification",
        pricing1F4: "Access to resources library",
        pricing1F5: "Access to community forum",

        pricing2Title: "Professional",
        pricing2Price: "€899",
        pricing2F1: "Everything in Foundation",
        pricing2F2: "Live coaching sessions",
        pricing2F3: "Mentor program",
        pricing2F4: "Advanced certifications",
        pricing2F5: "Marketing toolkit",
        pricing2F6: "Priority support",

        pricing3Title: "Elite",
        pricing3Price: "€1499",
        pricing3F1: "Everything in Professional",
        pricing3F2: "1-on-1 mentoring",
        pricing3F3: "Professional development coaching",
        pricing3F4: "Featured coach profile",
        pricing3F5: "Lifetime platform access",
        pricing3F6: "Continuing education credits",

        pricingButton: "Get started",

        ctaTitle: "Ready to begin your journey?",
        ctaSubtitle:
            "Join the certified MindfulSpace coaches and make a real difference in people's lives. Create an account or sign in to access your profile, where you can submit a request to become a coach at any time.",
        ctaButtonPrimary: "Sign up now",
        ctaButtonSecondary: "Learn more",
    },

    premiumPage: {
        heroTitle: "Go Premium",
        heroSubtitle: "Unlock exclusive content, advanced programs, and a richer experience with MindfulSpace Premium.",

        whyTitle: "Why go Premium?",
        why1Title: "Access premium resources",
        why1Text: "In-depth articles, videos, and guides to take your well-being further every day.",
        why2Title: "Exclusive programs & sessions",
        why2Text: "Premium guided sessions and structured programs to progress faster and more calmly.",
        why3Title: "Get notified about new content",
        why3Text: "Receive alerts whenever new premium content is released (programs, meditations, resources).",
        why4Title: "Boost your progress",
        why4Text: "Advanced tools and journeys to build lasting habits and keep your motivation high.",

        programTitle: "What Premium unlocks",
        programSubtitle: "An enhanced experience designed to support you further, for longer.",

        program1Title: "Premium library",
        program1Duration: "Unlimited access",
        program1Item1: "Exclusive resources (articles, videos, guides)",
        program1Item2: "More practical, deeper content",
        program1Item3: "Favorites & quick access",

        program2Title: "Premium programs",
        program2Duration: "New journeys released regularly",
        program2Item1: "Structured programs (stress, sleep, focus, etc.)",
        program2Item2: "Step-by-step progression",
        program2Item3: "Goals and recommendations",

        program3Title: "Premium sessions",
        program3Duration: "New sessions every month",
        program3Item1: "Premium guided meditations",
        program3Item2: "Themed sessions (anxiety, energy, gratitude…)",
        program3Item3: "Flexible durations to fit your schedule",

        program4Title: "Notifications & tracking",
        program4Duration: "Always up to date",
        program4Item1: "Notifications for new premium content",
        program4Item2: "Personalized reminders (based on your goals)",
        program4Item3: "Enhanced history and progress",

        pricingTitle: "Choose your plan",

        pricing1Title: "Monthly",
        pricing1Price: "$9.99/month",
        pricing1F1: "Access to premium resources",
        pricing1F2: "Premium sessions",
        pricing1F3: "New content notifications",
        pricing1F4: "Cancel anytime",
        pricing1F5: "Multi-device access",

        pricing2Title: "Yearly",
        pricing2Price: "$79.99/year",
        pricing2F1: "Everything included in Monthly",
        pricing2F2: "Best value for a full year",
        pricing2F3: "Full access to premium programs",
        pricing2F4: "Early access to new releases",
        pricing2F5: "Personalized reminders",
        pricing2F6: "Priority support",

        pricing3Title: "Family",
        pricing3Price: "$119.99/year",
        pricing3F1: "Everything included in Yearly",
        pricing3F2: "Up to 5 accounts",
        pricing3F3: "Premium programs for the whole family",
        pricing3F4: "Per-profile preferences",
        pricing3F5: "Multi-device access",
        pricing3F6: "Priority support",

        pricingButton: "Get started",

        ctaTitle: "Go Premium in just a few steps",
        ctaSubtitle:
            "Create an account or sign in to access your profile, where you can activate the Premium subscription anytime.",
        ctaButtonPrimary: "Activate Premium",
        ctaButtonSecondary: "Learn more",
    },

    resourcesPage: {
        heroTitle: "Resources",
        heroSubtitle: "Explore our collection of articles and guides around wellbeing.",

        searchLabel: "Search a resource",
        searchPlaceholder: "Type a keyword (meditation, sleep, stress...)",

        allCategories: "All",

        listTitle: "Available resources",
        loading: "Loading resources…",
        empty: "No resources match your search yet.",

        premiumBadge: "Premium",
        premiumIconAlt: "Premium content",
        lockedPremiumResource: "Premium resource reserved for premium members",
        lockedPremiumTooltip: "Become a premium member to access this content",
        readTimeSuffix: "min",
        manageMyResources: "Manage my resources",
        viewAllResources: "View all resources",
    },

    breathingSession: {
        title: "Guided Breathing",

        phaseInhale: "Inhale",
        phaseHold: "Hold",
        phaseExhale: "Exhale",
        hold_full: "Block respiration…",
        hold_empty: "Release…",

        cycle: "Cycle",
        followInstruction: "Follow the breathing rhythm",

        skipStep: "Skip step",
        skipAll: "Skip all",

        nextStep: "Next step",

        skip: "Skip",

        and_now: "And now ?"
    },

    sessionRecap: {
        title: "Session completed",
        progressMessage: "You are making progress on your path to calm",
        dashboardButton: "My tracking",
        redoButton: "Do another session",
        reminder: "Come back tomorrow to continue your practice",
    },

    moodSession: {
        title: "How are you feeling?",
        subtitle: "Take a moment to acknowledge your emotions",
        continue: "Continue",
        note: "There is no right or wrong answer",
    },

    tipSession: {
        title: "Tip of the day",
        tipSourceLabel: "Tip from local JSON",
        mantraSourceLabel: "Tip generated by Groq (AI)",
        finishButton: "End the session",
        keepThought: "Keep this thought with you today",
        fallbackTip: "Take a deep breath and smile 🌿",
    },

    domainSleep: {
        title: "Sleep",
        subtitle: "Tools and tips to improve your sleep quality.",
        empty: "Content coming soon…",

        history_summary_nights: "nights",
        history_summary_hoursAvg: "hours on average",
        history_toggle_expand: "Show details",
        history_toggle_collapse: "Hide details",
        history_totalSleepLabel: "Total sleep",
        history_totalNightsLabel: "Total nights",
        history_averageQualityLabel: "Average quality",

        // Manual logging (only mode for sleep)
        manualForm_title: "Log a night of sleep",
        manualForm_description: "Record your bedtime, wake-up time and how restful your night felt.",
        manualForm_placeholder: "The form to log your nights of sleep will be available soon.",
        manualForm_durationLabel: "Sleep duration",
        manualForm_saveButton: "Save",
        manualForm_cancelButton: "Cancel",
        manualForm_dateLabel: "Date",
        manualForm_qualityLabel: "Perceived quality",

        // History
        history_title: "Your recent nights",
        history_placeholder: "Your sleep history will appear here as soon as you log a few nights.",
        history_nights: "nights",
        last7_empty: "No sleep recorded in the last 7 days.",
        history_average: "hours in average",

        detail: {
            kpisTitle: "Key metrics",
            trendTitle: "Trend",
            historyTitle: "History",
            kpi: {
                weekHours: "Hours (7 days)",
                avg30: "Average (30 days)",
                streak: "Streak",
                streakBestPrefix: "Best streak:",
                avgQuality: "Average quality",
                na: "—",
            },
            trendHours30: "Hours per night (last 30 days)",
            trendSma5: "Smoothing (5)",
            insightsTitle: "Insights (30 days)",
            insights: {
                activeNights: "Logged nights",
                bestNight: "Best night",
                goodQuality: "Quality ≥ 4/5",
                goodQualityHint: "of logged nights",
                variability: "Variability",
                variabilityHint: "std dev (h)",
                activeDays: "Active days",
                totalMinutes: "Total time",
                bestDay: "Best day",
                top3Types: "Top 3 types",
                coverage: "Coverage",
                goodQualityShort: "≥ 4/5",
            },
        },

    },

    domainExercise: {
        title: "Exercise",
        subtitle: "Track and log your exercise sessions.",

        history_summary_sessions: "sessions",
        history_summary_exercises: "exercises",
        history_toggle_expand: "Show details",
        history_toggle_collapse: "Hide details",
        history_totalRepsLabel: "Total reps",
        history_totalSessionsLabel: "Total sessions",
        history_averageQualityLabel: "Average quality",
        history_dayLabel: "Day",
        history_totalLabel: "total",
        history_sessionsLabel: "session",

        // Manual logging
        manualForm_title: "Log a past session",
        manualForm_description: "Select the date, exercise type and repetitions.",
        manualForm_dateLabel: "Session date",
        manualForm_typeLabel: "Exercise type",
        manualForm_typePlaceholder: "Choose an exercise",
        manualForm_repetitionsLabel: "Repetitions",
        manualForm_qualityLabel: "Quality / perceived effort",
        manualForm_saveButton: "Save",
        manualForm_savingButton: "Saving…",
        manualForm_cancelButton: "Cancel",
        manualForm_repetitionLabel: "Repetitions number",
        manualForm_button: "Log past session",

        // Guided session
        start_title: "Start an exercise session",
        start_button: "Start exercice",
        start_description: "Choose an exercise and follow the step-by-step guidance.",
        start_placeholder: "Guided exercise mode will be available soon.",
        start_nextButton: "Next",
        start_prevButton: "Previous",
        start_finishButton: "Done",

        // History
        history_title: "Your recent exercise sessions",
        history_placeholder: "Your session history will appear here once you record some.",

        // Workout Programs
        program_start_title: "Subscribe to a workout program",
        program_start_description: "Discover guided programs designed to help you stay consistent.",
        program_start_button: "See available programs",

        program_list_loading: "Loading programs…",
        program_list_title: "Available workout programs",
        program_list_days: "days",
        program_list_seeDetails: "See details",
        program_list_daysPerWeek: "days/week",
        program_details_back: "Back",
        program_details_subscribe: "Subscribe",
        program_details_unsubscribe: "Unsubscribe",

        exercice_plan_today_title: "Today's exercises",
        exercice_plan_today_empty: "Nothing planned today 🙂",
        exercice_plan_loading: "Loading...",

        weekday_0: "Sunday",
        weekday_1: "Monday",
        weekday_2: "Tuesday",
        weekday_3: "Wednesday",
        weekday_4: "Thursday",
        weekday_5: "Friday",
        weekday_6: "Saturday",

        detail: {
            kpisTitle: "Key metrics",
            trendTitle: "Trend",
            historyTitle: "History",
            kpi: {
                weekReps: "Reps (7 days)",
                avg30: "Average (30 days)",
                streak: "Streak",
                streakBestPrefix: "Best streak:",
                topExercise: "Top exercise",
                na: "—",
            },
            trend30: "Volume (last 30 days)",
            trendSma5: "Smoothing (5)",
            insightsTitle: "Insights (30 days)",
            insights: {
                activeDays: "Active days",
                totalMinutes: "Total time",
                bestDay: "Best day",
                top3: "Top 3 types",
                totalReps: "Total repetitions",
                coverage: "Coverage",
                intensity: "Intensity",
                intensityHint: "Reps per session",
            },
        },
    },

    domainMeditation: {
        // --- Wizard: types ---
        wizard_loadingTypes: "Loading meditation types…",
        wizard_errorTypes: "Unable to load meditation types.",
        wizard_stepType_title: "Which kind of meditation would you like to practice?",

        // --- Wizard: duration ---
        wizard_stepDuration_title: "Choose your session length",
        wizard_minutes: "minutes",
        wizard_backToType: "Back to type selection",

        // --- Wizard: content ---
        wizard_stepContent_title: "Choose a content",
        wizard_loadingContents: "Loading meditation contents…",
        wizard_errorContents: "Unable to load meditation contents.",
        wizard_stepContent_empty: "No content available for this type and duration.",
        wizard_premium: "Premium",
        wizard_backToDuration: "Back to duration selection",

        // --- Wizard: mood before ---
        wizard_stepMoodBefore_title: "How do you feel before this session?",
        wizard_backToContent: "Back to content selection",
        wizard_startSession: "Start session",

        // --- Wizard: playing (audio / timer / visual) ---
        wizard_stepPlaying_title: "Your session:",
        wizard_stepPlaying_placeholder: "This practice is not available yet in this version of the app.",
        wizard_endSession: "End session",
        wizard_cancel: "Cancel session",

        // --- Wizard: mood after ---
        wizard_stepMoodAfter_title: "How do you feel after this session?",
        wizard_saveError: "An error occurred while saving your session.",
        wizard_saving: "Saving…",
        wizard_save: "Save my session",

        // --- Wizard: done ---
        wizard_stepDone_title: "Nice job, your session has been saved!",
        wizard_stepDone_description: "Keep practising regularly to support your well-being every day.",
        wizard_close: "Close",

        // --- Wizard timer ---
        wizard_timer_remainingLabel: "Time remaining",
        wizard_timer_pause: "Pause",
        wizard_timer_resume: "Resume",
        wizard_timer_reset: "Reset",
        wizard_timer_finished: "Session finished",

        // --- History last 7 days ---
        last7_title: "Your last 7 days of meditation",
        last7_empty: "No session recorded in the last 7 days.",
        last7_toggle_expand: "Show details",
        last7_toggle_collapse: "Hide details",
        last7_totalMeditationLabel: "Total meditation",
        last7_totalSessionsLabel: "Number of sessions",
        last7_averageMoodLabel: "Average mood",
        last7_dayLabel: "Day",
        last7_totalLabel: "in total",

        // Generic labels if you want to use them
        sessionsLabel: "sessions",
        minutesLabel: "minutes",

        title: "Meditation",
        subtitle: "Guided practices to calm your mind.",
        empty: "Content coming soon…",

        // Manual entry
        manualForm_title: "Log a past session",
        manualForm_description: "Specify the date, duration, and optionally the perceived quality.",
        manualForm_dateLabel: "Date",
        manualForm_durationLabel: "Duration",
        manualForm_minutesSuffix: "minutes",
        manualForm_qualityLabel: "Perceived quality",
        manualForm_saveButton: "Save",
        manualForm_savingButton: "Saving…",
        manualForm_typeLabel: "Meditation type",
        manualForm_button: "Encode a meditation",
        manualForm_cancelButton: "Cancel",

        // Player / timer
        player_title: "Start a meditation session",
        player_description: "Choose a duration and let the timer guide you.",
        player_startButton: "Start meditation",
        player_modalTitle: "Timer-guided meditation",
        player_configText: "Choose your session duration. You may stop earlier if needed.",
        player_durationLabel: "Chosen duration",
        player_startNowButton: "Start session",
        player_runningText: "Session in progress. Close your eyes and breathe calmly.",
        player_stopEarlyButton: "End session",
        player_finishedText: "The session is over. How would you rate its quality?",
        player_finishedQualityLabel: "Session quality",
        player_saveButton: "Save this session",
        player_savingButton: "Saving…",

        // Last 7
        last7_description: "Overview of your recent meditations.",
        last7_loading: "Loading…",
        last7_durationLabel: "Duration",
        last7_qualityLabel: "Quality",
        errors: {
            loadTypes: "Error loading meditation types",
            loadSessions: "Error loading sessions",
            saveSession: "Error saving session"
        },

        meditationTypes: {
            breathing: {
                name: "Conscious breathing",
                description:
                    "Focusing on the breath to soothe the nervous system.",
            },
            mindfulness: {
                name: "Mindfulness",
                description:
                    "Observing thoughts, emotions and sensations without judgment.",
            },
            "body-scan": {
                name: "Body scan",
                description:
                    "Scanning the body with attention to release tension.",
            },
            compassion: {
                name: "Compassion / Metta",
                description:
                    "Cultivating kindness toward yourself and others.",
            },

            wizard_timer_remainingLabel: "Time remaining",
            wizard_timer_pause: "Pause",
            wizard_timer_resume: "Resume",
            wizard_timer_reset: "Reset",
            wizard_timer_finished: "Session finished, well done!"
        },

        last7_summary_sessions: "sessions",
        last7_summary_minutes: "minutes",

        detail: {
            kpisTitle: "Key metrics",
            trendTitle: "Trend",
            historyTitle: "History",
            kpi: {
                weekMinutes: "Minutes (7 days)",
                avg30: "Average (30 days)",
                streak: "Streak",
                streakBestPrefix: "Best streak:",
                topType: "Top type",
                na: "—",
            },
            trendMinutes30: "Minutes per session (last 30 days)",
            trendSma5: "Smoothing (5)",
            insightsTitle: "Insights (30 days)",
            insights: {
                activeDays: "Active days",
                totalMinutes: "Total time",
                bestDay: "Best day",
                top3Types: "Top 3 types",
                coverage: "Coverage",
                moodCoverage: "Mood recorded",
                moodCoverageShort: "Mood",
            },
        },
    },

    publicWorld: {
        worldAlt: "MindfulSpace world map",
        sleepAlt: "Sleep",
        exerciseAlt: "Exercise",
        meditationAlt: "Meditation",
        encodeSessionTitle: "Log a session",
        quickLogTitle: "Quick log",
        quickLogAriaSleep: "Quick log: sleep",
        quickLogAriaMeditation: "Quick log: meditation",
        quickLogAriaExercise: "Quick log: exercise",
        quickLogToastSaved: "✅ Session saved",
        worldStartTitle: "My world",
        worldStartSubtitle: "A quick glance, then start whenever you’re ready.",
        worldStartCta: "Start",
        worldPanelTitle: "MY WORLD",
        worldPanelCloseAria: "Close panel",
        worldPanelBackAria: "Go back",
        worldPanelHomeAria: "Back to overview",
        startSessionTitle: "Start a session",
    },

    world: {
        domainDetail: {
            back: "Back",
            subtitle: "Session analysis: trends, consistency, progression…",
        },

        sections: {
            quickActionsTitle: "Quick actions",
            quickActionsAria: "Quick actions section",
            domainsTitle: "Domains",
            domainsAria: "Domain selection section",
        },

        overview: {
            chipWeekMinutes: "min this week",
            chipWellbeing: "Well-being:",

            todayTitle: "Today",
            quickLogCta: "Log",

            snapshotTitle: "Snapshot",

            todayExercisesTitle: "Exercises of the day",
            todayActionsTitle: "Today’s actions",

            encodeSessionCta: "Log a session",
            encodeSessionSubtitle: "Quickly add a session (sleep, meditation, exercise).",
            startSessionCta: "Start a session",
            startSessionSubtitle: "Launch a guided session (meditation, exercise).",

            todayActionsHint: "Tip: small, regular logs improve your stats and help you earn badges.",

            viewAll: "View all badges",
            recentBadgesTitle: "Your latest badges",

            viewDetail: "View details",
            encode: "Log",

            sleepMainKpi: "Average duration",
            sleepKpiA: "Duration:",
            sleepKpiB: "Quality:",

            meditationMainKpi: "Last 7 days",
            meditationKpiA: "Sessions:",
            meditationKpiB: "Minutes:",

            exerciseMainKpi: "This week",
            exerciseKpiA: "Sessions:",
            exerciseKpiB: "Goals:",

            programSubscribeCta: "Subscribe to an exercise program",
            programSubscribeTitle: "Exercise programs",
            programSubscribeSubtitle: "Pick a program to plan your workouts and track your progress.",
            programsCta: "Subscribe to an exercise program",
            programsSubtitle: "Pick a program and get scheduled workouts.",

            chipStreak: "Streak:",
            metricsLoadError: "Unable to load metrics.",
            sleepFootnoteEmpty: "No sleep logged this week.",
            sleepFootnoteLastNight: "Last night:",
            meditationFootnoteEmpty: "No mood recorded.",
            meditationFootnoteMood: "Average mood:",
            exerciseFootnoteEmpty: "No quality recorded.",
            exerciseFootnoteQuality: "Average quality:",

            recentBadgesEmpty: "No badges to display for now.",

            topSummaryAria: "Preview of your last 7 days datas",

            trendTitle: "Trend",
            last7Days: "Last 7 days",
            wellbeingBarLabel: "Wellbeing",
            statusImprove: "Needs improvement",
            statusStable: "Stable",
        },

        panel: {
            titles: {
                overview: "MY WORLD",
                badges: "Badges",
                quickLog: "Quick log",
                startSession: "Start a session",
            },
            backAria: "Back",
            closeAria: "Close",
        },

        startSession: {
            title: "Start a session",
            hint: "Pick a session type and get started.",
        },

        programs: {
            title: "Exercise programs",
            switchHint: "Later: meditation programs too.",
        },

        cards: {
            encodeSessionTitle: "Log a session",
        },

        actions: {
            quickLog: "Quick log",
            viewAllBadges: "View all my badges",
        },

        domains: {
            sleep: "Sleep",
            meditation: "Meditation",
            exercise: "Exercise",
        },

        toasts: {
            sessionSaved: "Session saved",
            sessionSavedOffline: "Session saved offline",
        },
    },

    resourceDetailPage: {
        heroSubtitle: "Explore this well-being resource",
        backToList: "Back to resources",
        loading: "Loading resource…",
        loadingTitle: "Loading…",
        fallbackTitle: "Resource",
        errorTitle: "An error occurred",
        errorGeneric: "Unable to load this resource at the moment.",
        errorNetwork: "Network issue detected. Please try again later.",
        notFoundTitle: "Resource not found",
        notFoundText: "This resource does not exist or is no longer available.",
        readTimeSuffix: "min read",
        premiumBadge: "Premium",
        featuredBadge: "Featured",
        noContent: "The content of this resource is not yet available.",
        forbiddenTitle: "Access restricted",
        forbiddenText: "This resource is reserved for premium members. Please sign in with a premium account to access it.",
        backToListCTA: "Back to resources list",
        authorLabel: "By",
        publishedLabel: "Published on",
        updatedLabel: "Updated on",
        externalLinkTitle: "Related content",
        externalLinkDescription: "An external link is associated with this resource to explore the topic further",
        openExternalLink: "View link"
    },

    notFoundPage: {
        heroTitle: "Page not found",
        heroSubtitle: "It looks like this page went off to meditate somewhere else.",
        heading: "This page seems to have lost its way.",
        bodyIntro:
            "The address you entered does not match any MindfulSpace page. The link may be incorrect or the page may have been moved.",
        bodyBack:
            "You can gently return to a familiar space by going back to the home page.",
        backHome: "⬅ Back to home",
        secondTitle: "Need a point of reference?",
        secondText:
            "Take a breath, then use the main menu to find your dashboard, your sessions, or your goals.",
    },

    errorPage: {
        heroTitle: "Something unexpected happened",
        heroSubtitle: "Even MindfulSpace sometimes needs a moment to breathe.",
        heading: "A small technical turbulence appeared.",
        body:
            "An error occurred while loading this page. You can try again, or gently return to the MindfulSpace home page.",
        retry: "Try again",
        backHome: "⬅ Back to home",
        secondTitle: "Important reminder",
        secondText:
            "MindfulSpace is an academic, fictional project. Please do not use this platform for emergencies or medical needs.",
    },

    adminHome: {
        title: "Administrator area",
        subtitle: "Section dedicated to managing and monitoring the MindfulSpace project.",
        placeholder: "Area to implement: add the administration screens here (users, content, settings…).",
    },

    coachHome: {
        title: "Coach area",
        subtitle: "Section dedicated to tools and features for MindfulSpace coaches.",
        placeholder: "Area to implement: add coach-related screens here (guidance, tracking, communication…).",
    },

    /*
     * Components
     */
    footer: {
        deployMessage: "Deployed with ❤️ and calm",
        cookiesLink: "Cookies",
        cookiePolicy: "Cookie policy",
        legalNotice: "Legal notice",
        privacyPolicy: "Privacy",
    },

    langSwitcher: {
        label: "Language",
        switchTo: "Switch to",
    },

    globalNotice: {
        message:
            "This is a student project application.",
    },

    offlineNotice: {
        message:
            "Offline mode - displaying cached data.",
    },

    moodPicker: {
        ariaLabel: "Mood selection",
        closed: "Difficult",
        low: "Not great",
        medium: "Okay",
        good: "Good",
        open: "Excellent",

        labels: {
            very_bad: "Very bad",
            bad: "Bad",
            neutral: "Neutral",
            good: "Good",
            very_good: "Very good",
        },
    },

    cookieBanner: {
        title: "Cookies & wellbeing 🍪",
        description:
            "We use essential cookies to make the site work. With your consent, we also use cookies to analyse usage and personalise your experience.",
        acceptAll: "OK for me",
        choose: "Let me choose",
        hint: "You can change your choices at any time in \"Cookies\".",
    },

    cookieModal: {
        title: "Cookie preferences",

        analyticsTitle: "Analytics cookies",
        analyticsDescription:
            "Help us understand how the application is used.",

        personalizationTitle: "Personalisation",
        personalizationDescription:
            "Allows us to personalise the content shown to you.",

        essentialTitle: "Essential cookies",
        essentialDescription:
            "Required for the application to function.",

        cancel: "Cancel",
        save: "Save",
    },

    quickLogCard: {
        title: "Quick Log",
        subtitle: "Record your daily wellness metrics in a few seconds.",

        loggingFor: "Logging for",
        todaySuffix: "today",
        yesterdaySuffix: "yesterday",

        today: "Today",
        yesterday: "Yesterday",
        chooseAnotherDate: "Choose another date",

        valueLabel: "Value",
        qualityLabel: "Quality",

        saving: "Saving…",
        submit: "Save",

        success: "Session logged successfully.",
        error: "Error while logging the session.",
    },

    /*
     * Authentication
     */
    auth: {
        // Login page
        loginTitle: "Welcome Back",
        loginSubtitle: "Sign in to your MindfulSpace account",
        emailLabel: "Email",
        emailPlaceholder: "your@email.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••",
        forgotPassword: "Forgot password?",
        signInButton: "Sign In",
        orContinueWith: "or continue with",
        noAccount: "Don't have an account?",
        signUpLink: "Sign up",
        invalidCredentials: "Invalid email or password",

        // Register page
        registerTitle: "Create Account",
        registerSubtitle: "Start your mindfulness journey today",
        fullNameLabel: "Full Name",
        fullNamePlaceholder: "John Doe",
        confirmPasswordLabel: "Confirm Password",
        passwordRequirements: "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
        createAccountButton: "Create Account",
        alreadyHaveAccount: "Already have an account?",
        signInLink: "Sign in",

        // Register success
        checkEmailTitle: "Check Your Email",
        checkEmailSubtitle: "We've sent you a verification link",
        checkEmailMessage: "Please check your email {email} and click the verification link to activate your account.",
        checkEmailNote: "Didn't receive the email? Check your spam folder or contact support.",
        backToLogin: "Back to Login",

        // Validation errors
        nameMinLength: "Name must be at least 2 characters",
        passwordMinLength: "Password must be at least 8 characters",
        passwordUppercase: "Password must contain an uppercase letter",
        passwordLowercase: "Password must contain a lowercase letter",
        passwordNumber: "Password must contain a number",
        passwordSpecial: "Password must contain a special character (@$!%*?&)",
        passwordsNoMatch: "Passwords do not match",
        registrationFailed: "Registration failed",

        // OAuth callback
        signingIn: "Signing You In...",
        authenticationFailed: "Authentication Failed",
        redirectingToLogin: "Redirecting to login...",

        // OAuth buttons
        continueWithGoogle: "Continue with Google",
        continueWithGithub: "Continue with GitHub",

        // Auth buttons
        signIn: "Sign In",
        signUp: "Sign Up",

        // User menu
        myWorld: "My World",
        profileSettings: "Profile Settings",
        adminPanel: "Admin Panel",
        signOut: "Sign Out",

        // Email verification
        verifyEmailLoading: "Verifying...",
        verifyEmailSuccess: "Email Verified!",
        verifyEmailFailed: "Verification Failed",
        verifyEmailInvalidLink: "Invalid verification link",
        verifyEmailSuccessMessage: "Email verified successfully!",
        verifyEmailVerificationFailed: "Verification failed",
        verifyEmailCanSignIn: "You can now sign in to your account.",
        verifyEmailLinkExpired: "The link may have expired or is invalid.",
        verifyEmailGoToLogin: "Go to Login",
        verifyEmailRegisterAgain: "Register Again",

        // Forgot password
        forgotPasswordTitle: "Forgot Password?",
        forgotPasswordSubtitle: "Enter your email to receive reset instructions",
        forgotPasswordSendButton: "Send Reset Link",
        forgotPasswordCheckEmail: "Check Your Email",
        forgotPasswordInstructionsSent: "Password reset instructions sent",
        forgotPasswordCheckEmailMessage: "If an account exists with {email}, you will receive password reset instructions.",
        forgotPasswordCheckSpam: "Didn't receive the email? Check your spam folder or try again.",
        forgotPasswordTryAnother: "Try Another Email",
        forgotPasswordFailedToSend: "Failed to send reset email",

        // Reset password
        resetPasswordTitle: "Reset Password",
        resetPasswordSubtitle: "Enter your new password",
        resetPasswordNewPasswordLabel: "New Password",
        resetPasswordConfirmPasswordLabel: "Confirm New Password",
        resetPasswordButton: "Reset Password",
        resetPasswordInvalidLink: "Invalid Link",
        resetPasswordLinkExpired: "The reset link is invalid or has expired.",
        resetPasswordRequestNew: "Request New Link",
        resetPasswordComplete: "Password Reset Complete",
        resetPasswordSuccess: "Your password has been successfully reset. You can now sign in with your new password.",
        resetPasswordFailed: "Password reset failed",

        goToProfile: "Go to my profile",
    },

    profile: {
        // Page title
        pageTitle: "Profile Settings",
        pageSubtitle: "Manage your personal information and security settings",

        // Account Information Section
        accountInfoTitle: "Account Information",
        displayNameLabel: "Display Name",
        displayNamePlaceholder: "Your name",
        emailLabel: "Email Address",
        emailVerifiedBadge: "Verified",
        emailNotVerifiedBadge: "Not Verified",
        accountCreatedLabel: "Account Created",
        accountStatusLabel: "Account Status",
        accountStatusActive: "Active",
        accountStatusSuspended: "Suspended",
        updateProfileButton: "Update Profile",
        profileUpdatedSuccess: "Profile updated successfully",

        // Security Settings Section
        securityTitle: "Security",
        changePasswordTitle: "Change Password",
        currentPasswordLabel: "Current Password",
        newPasswordLabel: "New Password",
        changePasswordButton: "Change Password",
        passwordChangedSuccess: "Password changed successfully",
        noPasswordSet: "OAuth-only account - no password set",

        // Connected Accounts
        connectedAccountsTitle: "Connected Accounts",
        connectedSince: "Connected since",
        unlinkButton: "Unlink",
        noConnectedAccounts: "No OAuth accounts connected",
        unlinkConfirm: "Are you sure you want to unlink this account?",
        unlinkSuccess: "Account unlinked successfully",
        unlinkError: "Cannot unlink the only authentication method",

        // Active Sessions
        activeSessionsTitle: "Active Sessions",
        currentSessionBadge: "Current Session",
        deviceLabel: "Device",
        ipAddressLabel: "IP Address",
        lastActiveLabel: "Last Active",
        revokeSessionButton: "Revoke",
        revokeAllOtherButton: "Revoke All Other Sessions",
        noActiveSessions: "No active sessions",
        revokeSessionConfirm: "Are you sure you want to revoke this session?",
        revokeAllConfirm: "Are you sure you want to revoke all other sessions?",
        sessionRevokedSuccess: "Session revoked successfully",
        allSessionsRevokedSuccess: "All other sessions have been revoked",

        // Data Privacy
        dataPrivacyTitle: "Data Privacy",
        exportDataButton: "Download My Data",
        exportDataDescription: "Download all your personal data in JSON format (GDPR)",
        exportDataSuccess: "Your data has been downloaded",
        deleteAccountButton: "Delete My Account",
        deleteAccountDescription: "Permanently delete your account and all your data",
        deleteAccountWarning: "This action is irreversible. All your data will be permanently deleted.",
        deleteAccountConfirm: "Are you sure you want to delete your account?",
        deleteAccountPasswordLabel: "Enter your password to confirm",
        deleteAccountConfirmButton: "Yes, Delete My Account",
        deleteAccountCancelButton: "Cancel",
        accountDeletedSuccess: "Your account has been deleted",

        // Subscription & Roles
        subscriptionTitle: "Subscription",
        currentSubscriptionLabel: "Current Subscription",
        subscriptionStandard: "Standard",
        subscriptionPremium: "Premium",
        subscriptionCoach: "Coach",
        upgradeToPremiumButton: "Upgrade to Premium",
        upgradeToPremiumDescription: "Unlock exclusive content, advanced programs and richer tracking",
        premiumFeature1: "Access premium resources",
        premiumFeature2: "Exclusive programs & sessions",
        premiumFeature3: "Get notified of new content",
        premiumFeature4: "Accelerate your progress",

        // Coach upgrade section
        upgradeToCoachButton: "Become a Coach",
        upgradeToCoachDescription: "Transform lives — and yours — through our certified program",
        coachFeature1: "Build a community",
        coachFeature2: "Develop your practice",
        coachFeature3: "Make a difference",
        coachFeature4: "Gain recognition",

        // Errors
        errorLoadingProfile: "Error loading profile",
        errorUpdatingProfile: "Error updating profile",
        errorChangingPassword: "Error changing password",
        errorRevokingSession: "Error revoking session",
        errorUnlinkingAccount: "Error unlinking account",
        errorDeletingAccount: "Error deleting account",

        // Subscription request success
        requestSubmittedSuccess: "Your request has been successfully submitted!",
        requestCancelledSuccess: "Request cancelled successfully",
        errorCancellingRequest: "Error cancelling request",

        // My Requests Section
        myRequestsTitle: "My Subscription Requests",
        pendingRequests: "pending",
        loadingRequests: "Loading requests...",
        noRequestsYet: "No requests yet",
        noRequestsHint: "Use the buttons above to submit an upgrade request",
        requestTypePremium: "Premium",
        requestTypeCoach: "Coach",
        tierLabel: "Tier",
        submittedOn: "Submitted on",
        motivation: "Motivation",
        approvedBy: "Approved by",
        rejectedBy: "Rejected by",
        on: "on",
        adminUser: "Administrator",
        adminNotes: "Admin Notes",
        cancelRequest: "Cancel",
        cancelling: "Cancelling...",
        cancelRequestConfirm: "Are you sure you want to cancel this request?",

        // Request statuses
        requestStatusPENDING: "Pending",
        requestStatusAPPROVED: "Approved",
        requestStatusREJECTED: "Rejected",
        requestStatusCANCELLED: "Cancelled",
    },

    subscriptionRequests: {
        // Premium request
        requestPremiumTitle: "Become Premium Member",
        premiumFormIntro: "Fill out this form to request Premium access. An administrator will review your request shortly.",

        // Coach request
        requestCoachTitle: "Become a Coach",
        coachFormIntro: "Fill out this form to request coach status. Your experience and qualifications will be reviewed by our team.",
        selectTierLabel: "Choose your plan",
        recommended: "Recommended",

        // Form fields
        motivationLabel: "Motivation",
        motivationPlaceholder: "Why do you want this upgrade?",
        experienceLabel: "Experience and qualifications",
        experiencePlaceholder: "Describe your relevant experience in coaching, wellness, meditation, etc.",
        optional: "optional",

        // Actions
        cancel: "Cancel",
        back: "Back",
        continueToForm: "Continue to Form",
        submitRequest: "Submit Request",
        submitting: "Submitting...",

        // Success
        successTitle: "Request Sent!",
        successMessage: "An administrator will review your request shortly. You will be notified of the decision.",

        // Errors
        errorSubmitting: "Error submitting request",
    },

    badges: {
        latestBadgesTitle: "Your latest badges",
        viewAllBadgesLink: "See all my badges",

        toastUnlockedTitle: "New badge unlocked",
        toastUnlockedSubtitle: "You just unlocked a badge!",

        allBadgesTitle: "My badges",
        loading: "Loading…",

        badgesCount: "{count} badges earned",
        noBadgesYet: "No badges yet.",
        noBadgesYetLong:
            "Keep practicing (sleep, meditation, exercise) to unlock new badges.",
        earnedOnLabel: "Earned on",
        recentlyEarnedTitle: "Recently earned badges",

        meditation: {
            first: {
                title: "First meditation session",
                description: "You completed your very first meditation session.",
            },
            five: {
                title: "5 meditation sessions completed",
                description: "You've completed 5 sessions. Keep going!",
            },
            streak3: {
                title: "3-day meditation streak",
                description: "You meditated 3 days in a row. Great consistency!",
            },
        },

        exercice: {
            first: {
                title: "First exercise session",
                description: "You logged your first exercise session.",
            },
            streak3: {
                title: "3-day exercice streak",
                description: "You made exercises 3 days in a row. Great consistency!",
            },
        },

        sleep: {
            first: {
                title: "First tracked night of sleep",
                description: "You logged your first night of sleep.",
            },
        },

        generic: {
            firstSession: {
                title: "First MindfulSpace session",
                description: "Welcome! You started using MindfulSpace.",
            },
        },

        quickLogSaved: {
            title: "Session saved",
            description: "Well done for this new step !",
        },
    },

    /*
     * Resources Management
     */
    resourcesManagement: {
        title: "Resources Management",
        loading: "Loading...",
        myResources: "My Resources",
        allResources: "All Resources",
        createResource: "Create Resource",
        createResourceDescription: "Create a new resource with automatic translation support",
        editResource: "Edit Resource",
        deleteResource: "Delete Resource",

        // List view
        noResources: "No resources",
        noResourcesDescription: "You haven't created any resources yet.",
        searchPlaceholder: "Search resources...",
        filterByCategory: "Filter by category",
        allCategories: "All categories",

        // Resource types
        types: {
            ARTICLE: "Article",
            VIDEO: "Video",
            GUIDE: "Guide",
            MEDITATION_PROGRAM: "Meditation Program",
            EXERCICE_PROGRAM: "Exercise Program",
        },

        // Form labels
        form: {
            title: "Title",
            titlePlaceholder: "Resource title",
            titleHelper: "The title will appear in the resources list",

            slug: "Slug (URL)",
            slugPlaceholder: "resource-title",
            slugHelper: "URL-friendly identifier (lowercase letters, numbers, and hyphens only)",
            generateSlug: "Generate automatically",

            summary: "Summary",
            summaryPlaceholder: "Short description of the resource",
            summaryHelper: "Appears in resource cards (max 500 characters)",

            content: "Content",
            contentPlaceholder: "Full content of the resource (Markdown supported)",
            contentHelper: "The full content of your resource",

            type: "Resource Type",
            typeHelper: "Choose the content type",

            category: "Category",
            categoryHelper: "Main category of the resource",
            selectCategory: "Select a category",

            tags: "Tags",
            tagsHelper: "Select relevant tags (optional)",
            selectTags: "Select tags",

            isPremium: "Premium content",
            isPremiumHelper: "Reserve for premium users",

            isFeatured: "Featured",
            isFeaturedHelper: "Display on the homepage (admin only)",

            authorName: "Author Name",
            authorNamePlaceholder: "Dr. Sarah Johnson",
            authorNameHelper: "Name displayed as author (optional)",

            readTimeMin: "Reading time (min)",
            readTimeMinPlaceholder: "8",
            readTimeMinHelper: "Estimated reading time in minutes",
            calculateReadTime: "Calculate automatically",

            externalUrl: "External URL",
            externalUrlPlaceholder: "https://youtu.be/...",
            externalUrlHelper: "Link to a YouTube video or external article (optional)",

            meditationProgram: "Meditation Program",
            meditationProgramHelper: "Link to an existing meditation program (optional)",
            selectProgram: "Select a program",

            sourceLocale: {
                label: "Source Language",
                helper: "Language in which you're writing the content",
            },

            metadataSection: "Resource Metadata",
            readOnly: "Read-only",
        },

        // Wizard
        wizard: {
            translating: {
                title: "Translating...",
                description: "Our AI is translating your resource into other languages. This may take a few seconds.",
            },
            review: {
                instructions: "Review and modify the automatically generated translations. You can adjust any field before saving.",
                sourceLanguage: "Source Language",
                translation: "Translation",
            },
        },

        // Actions
        actions: {
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            create: "Create",
            back: "Back",
            viewPublic: "View public version",
            translateAndReview: "Translate & Review",
            translating: "Translating...",
            saving: "Saving...",
            saveAll: "Save All",
        },

        // Success messages
        success: {
            created: "Resource created successfully",
            updated: "Resource updated successfully",
            deleted: "Resource deleted successfully",
        },

        // Error messages
        errors: {
            loadFailed: "Error loading resources",
            createFailed: "Error creating resource",
            updateFailed: "Error updating resource",
            deleteFailed: "Error deleting resource",
            notFound: "Resource not found",
            unauthorized: "You don't have permission to edit this resource",
            slugExists: "This slug is already in use",
            invalidSlug: "Slug must contain only lowercase letters, numbers, and hyphens",
            requiredField: "This field is required",
            minLength: "Too short",
            maxLength: "Too long",
            invalidUrl: "Invalid URL",
            translationFailed: "Automatic translation failed",
        },

        // Delete confirmation
        deleteConfirm: {
            title: "Delete resource?",
            message: "Are you sure you want to delete this resource? This action is irreversible.",
            warningLinked: "Warning: This resource is linked to a meditation program. Only administrators can delete it.",
            confirm: "Yes, delete",
            cancel: "No, cancel",
        },

        // Resource card
        card: {
            premium: "Premium",
            featured: "Featured",
            readTime: "{{minutes}} min read",
            author: "By {{author}}",
            createdAt: "Created on {{date}}",
            updatedAt: "Updated on {{date}}",
            views: "{{count}} view",
            views_plural: "{{count}} views",
        },

        // Filters
        filters: {
            all: "All",
            premium: "Premium only",
            free: "Free only",
            featured: "Featured",
            myResources: "My resources",
        },

        // Stats
        stats: {
            total: "Total",
            premium: "Premium",
            free: "Free",
            featured: "Featured",
        },
    },

    taxonomyManagement: {
        title: "Taxonomy Management",
        subtitle: "Manage categories and tags to organize your resources",

        // Tabs
        tabs: {
            categories: "Categories",
            tags: "Tags",
        },

        // Categories section
        categories: {
            title: "Resource Categories",
            description: "Categories organize your resources into broad themes (Sleep, Stress, etc.)",
            createNew: "New Category",
            editCategory: "Edit Category",
            deleteCategory: "Delete Category",
            noCategories: "No categories",
            noCategoriesDescription: "Start by creating your first category",
            resourceCount: "{{count}} resource",
            resourceCount_plural: "{{count}} resources",

            form: {
                name: "Category Name",
                namePlaceholder: "E.g.: Sleep, Stress, Meditation",
                nameHelper: "Name displayed to users",

                slug: "Slug (URL)",
                slugPlaceholder: "sleep",
                slugHelper: "Unique identifier for URLs (lowercase letters, numbers and hyphens only)",

                iconEmoji: "Icon (emoji)",
                iconEmojiPlaceholder: "😴",
                iconEmojiHelper: "Emoji displayed in the interface (optional)",
            },

            deleteConfirm: {
                title: "Delete category?",
                message: "Are you sure you want to delete this category?",
                warningHasResources: "Cannot delete: {{count}} resource is using this category. Reassign or delete these resources first.",
                warningHasResources_plural: "Cannot delete: {{count}} resources are using this category. Reassign or delete these resources first.",
                confirm: "Yes, delete",
                cancel: "Cancel",
            },
        },

        // Tags section
        tags: {
            title: "Resource Tags",
            description: "Tags allow finer content labeling (stress, sleep, relaxation, etc.)",
            createNew: "New Tag",
            editTag: "Edit Tag",
            deleteTag: "Delete Tag",
            noTags: "No tags",
            noTagsDescription: "Start by creating your first tag",
            resourceCount: "{{count}} resource",
            resourceCount_plural: "{{count}} resources",

            form: {
                name: "Tag Name",
                namePlaceholder: "E.g.: stress, sleep, relaxation",
                nameHelper: "Name displayed to users",

                slug: "Slug (URL)",
                slugPlaceholder: "stress",
                slugHelper: "Unique identifier for URLs (lowercase letters, numbers and hyphens only)",
            },

            deleteConfirm: {
                title: "Delete tag?",
                message: "Are you sure you want to delete this tag? It will be removed from all resources that use it.",
                confirm: "Yes, delete",
                cancel: "Cancel",
            },
        },

        // Actions
        actions: {
            create: "Create",
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            close: "Close",
        },

        // Success messages
        success: {
            categoryCreated: "Category created successfully",
            categoryUpdated: "Category updated successfully",
            categoryDeleted: "Category deleted successfully",
            tagCreated: "Tag created successfully",
            tagUpdated: "Tag updated successfully",
            tagDeleted: "Tag deleted successfully",
            translationSaved: "Translation saved successfully",
            translationDeleted: "Translation deleted successfully",
            translationRegenerated: "Translation regenerated successfully",
        },

        // Error messages
        errors: {
            categoryCreateFailed: "Error creating category",
            categoryUpdateFailed: "Error updating category",
            categoryDeleteFailed: "Error deleting category",
            tagCreateFailed: "Error creating tag",
            tagUpdateFailed: "Error updating tag",
            tagDeleteFailed: "Error deleting tag",
            loadFailed: "Error loading",
            slugExists: "This slug is already in use",
            invalidSlug: "Slug must only contain lowercase letters, numbers and hyphens",
            requiredField: "This field is required",
            minLength: "Too short (minimum {{min}} characters)",
            maxLength: "Too long (maximum {{max}} characters)",
            translationLoadFailed: "Failed to load translations",
            translationGenerateFailed: "Failed to generate translation",
            translationSaveFailed: "Failed to save translation",
            translationDeleteFailed: "Failed to delete translation",
            translationRegenerateFailed: "Failed to regenerate translation",
            translateTextFailed: "Failed to translate text",
        },
    }


};

export default en;
