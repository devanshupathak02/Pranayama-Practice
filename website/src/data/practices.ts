import { PranayamaPractice } from "@/types";

export const PRANAYAMA_PRACTICES: PranayamaPractice[] = [
  {
    id: "anulom-vilom",
    name: "Anulom Vilom",
    sanskritName: "अनुलोम विलोम",
    englishName: "Alternate Nostril Breathing",
    shortDescription:
      "A rhythmic alternate-nostril breathing practice that harmonizes the sympathetic and parasympathetic nervous systems without breath retention.",
    fullDescription:
      "Anulom Vilom is one of the most accessible and profound foundation practices in traditional yoga. By alternating the airflow between the left nostril (associated with the cooling Ida nadi and parasympathetic calm) and the right nostril (associated with the heating Pingala nadi and alertness), this practice restores biological equilibrium, quiets mental chatter, and prepares the mind for deep stillness.",
    beginnerFriendly: true,
    difficulty: "Beginner",
    durationMinutes: 5,
    image: "/images/pranayama/anulom_vilom.png",
    articleSlug: "mastering-nadi-shodhana-subtle-energy-balance",
    focus: "Nervous System Equilibrium",
    instructions: [
      "Sit in a steady upright posture with relaxed shoulders and an elongated spine.",
      "Adopt Vishnu Mudra with your right hand: fold the index and middle fingers inward toward the palm.",
      "Gently seal your right nostril with your thumb and inhale smoothly through the left nostril for 4 counts.",
      "Release the right nostril, seal the left nostril with your ring finger, and exhale smoothly through the right for 4 to 8 counts.",
      "Inhale through the right nostril for 4 counts, then seal and exhale through the left for 4 to 8 counts. This completes one cycle.",
    ],
    contraindications: "Practice gently with a clear nasal passage; avoid forcing the airflow.",
  },
  {
    id: "nadi-shodhana",
    name: "Nadi Shodhana",
    sanskritName: "नाडी शोधन",
    englishName: "Channel Purification with Kumbhaka",
    shortDescription:
      "The classical subtle channel purification incorporating controlled internal and external breath suspension (kumbhaka).",
    fullDescription:
      "Whereas Anulom Vilom focuses on continuous alternate flow, classical Nadi Shodhana introduces proportional retention (Antar Kumbhaka) and suspension (Bahya Kumbhaka). It systematically dissolves energetic impurities across the subtle channels (nadis), refining mental focus and steadying heartbeat variability.",
    beginnerFriendly: false,
    difficulty: "Intermediate",
    durationMinutes: 8,
    image: "/images/pranayama/anulom_vilom.png",
    articleSlug: "mastering-nadi-shodhana-subtle-energy-balance",
    focus: "Mental Clarity & Pranic Purification",
    instructions: [
      "Begin only after establishing ease with uninterrupted 1:2 alternate nostril breathing.",
      "Inhale through the left nostril (1 count ratio).",
      "Gently close both nostrils and retain the breath internally with an open, relaxed throat (up to 2-4 count ratio).",
      "Exhale smoothly through the right nostril without gasping (2 count ratio).",
      "Repeat smoothly starting on the right side.",
    ],
    contraindications: "Avoid breath retention if experiencing hypertension, vertigo, or during pregnancy.",
  },
  {
    id: "bhramari",
    name: "Bhramari",
    sanskritName: "भ्रामरी",
    englishName: "Humming Bee Breath",
    shortDescription:
      "A deeply soothing practice producing an internal acoustic vibration that stimulates nitric oxide release and settles mental anxiety.",
    fullDescription:
      "Named after the Indian black bee (Bhramari), this practice uses an audible, gentle humming sound during extended exhalation. The continuous resonant vibration stimulates mechanoreceptors along the cranial bones, sinuses, and larynx, accelerating vagal nerve stimulation and producing an immediate cooling, introspective peace.",
    beginnerFriendly: true,
    difficulty: "All Levels",
    durationMinutes: 4,
    image: "/images/pranayama/bhramari.png",
    articleSlug: "bhramari-nitric-oxide-cranial-resonance",
    focus: "Stress Relief & Introspection",
    instructions: [
      "Sit comfortably with your eyes closed and jaw gently unclenched, lips softly touching.",
      "Optionally close the ear flaps (tragus) lightly with your thumbs to internalize the acoustic resonance (Shanmukhi Mudra).",
      "Take a natural, effortless nasal inhalation into the lower ribs.",
      "Exhale while producing a smooth, sustained, low-pitched humming sound 'Mmmmmm' in the back of the palate.",
      "Feel the gentle vibration radiating through your skull, brow, and heart space.",
    ],
    contraindications: "Gentle and safe for all practitioners; avoid high volume or throat strain.",
  },
  {
    id: "ujjayi",
    name: "Ujjayi",
    sanskritName: "उज्जायी",
    englishName: "Ocean Breath / Victorious Breath",
    shortDescription:
      "Subtle glottic contraction that creates an oceanic whispering sound, lengthening the respiratory cycle and steadying body temperature.",
    fullDescription:
      "Ujjayi is characterized by a soft whispering resonance produced by partially closing the glottis at the back of the throat. This subtle resistance slows the velocity of incoming air, warms it, and allows the practitioner to lengthen both inhalation and exhalation naturally. It is the signature breath used in classical meditative absorption and mindful vinyasa.",
    beginnerFriendly: true,
    difficulty: "All Levels",
    durationMinutes: 6,
    image: "/images/pranayama/ujjayi.png",
    articleSlug: "ujjayi-and-vagal-tone-ocean-breath-neurobiology",
    focus: "Sensory Anchoring & Autonomic Calm",
    instructions: [
      "Keep the lips sealed and breathe exclusively through the nose.",
      "Gently constrict the muscles in the back of the throat as if softly whispering or fogging a mirror with your mouth closed.",
      "Maintain a smooth, continuous oceanic sound on both the inhalation and exhalation.",
      "Ensure the breath remains soft and silky without harsh friction or strain.",
    ],
    contraindications: "Safe for general practice; release throat constriction if feeling tightness.",
  },
  {
    id: "bhastrika",
    name: "Bhastrika",
    sanskritName: "भस्त्रिका",
    englishName: "Bellows Breath",
    shortDescription:
      "A dynamic, invigorating practice with equal, powerful inhalations and exhalations that oxygenates the body and disperses lethargy.",
    fullDescription:
      "Bhastrika mimics the steady rhythm of a blacksmith's bellows. Both inhalation and exhalation are active and powered by diaphragmatic action. This technique clears stagnation from the bronchial passages, elevates prana throughout the vital channels, and leaves the practitioner alert yet centered.",
    beginnerFriendly: false,
    difficulty: "Intermediate",
    durationMinutes: 3,
    image: "/images/pranayama/bhastrika.png",
    articleSlug: "physiology-of-prolonged-exhalation",
    focus: "Vitality & Pranic Activation",
    instructions: [
      "Sit in an erect meditation posture with chin level and spine buoyant.",
      "Inhale fully into the abdomen and chest with moderate, controlled vigor.",
      "Exhale actively with the same rhythm through the nostrils without forcing.",
      "Complete 10 to 15 continuous bellows cycles, then take a deep breath in and pause in quiet witness observation.",
    ],
    contraindications:
      "Strictly avoid during pregnancy, hypertension, cardiovascular conditions, epilepsy, hernia, glaucoma, vertigo, or acute gastric ulcers. Never force breath retention.",
  },
  {
    id: "kapalbhati",
    name: "Kapalbhati",
    sanskritName: "कपालभाति",
    englishName: "Frontal Brain Cleansing",
    shortDescription:
      "Rhythmic passive inhalations paired with gentle abdominal expulsions, followed by profound effortless suspension (Kevala Kumbhaka).",
    fullDescription:
      "Classified traditionally as a shatkarma (cleansing process), Kapalbhati cleanses the respiratory tract and frontal sinus passages. The hallmark of authentic practice is not vigorous force, but the spontaneous, peaceful silence (witness phase) that naturally emerges when blood gases balance in the pause.",
    beginnerFriendly: true,
    difficulty: "Beginner",
    durationMinutes: 5,
    image: "/images/pranayama/kapalbhati.png",
    articleSlug: "why-silence-belongs-after-kapalbhati",
    focus: "Clarity & Spontaneous Stillness",
    instructions: [
      "Sit tall with relaxed shoulders and chest lifted.",
      "Draw the lower abdomen inward toward the spine with a brisk, active nasal exhalation.",
      "Allow the inhalation to happen passively and effortlessly as the abdomen releases.",
      "Maintain a steady pace of 1 expulsion per second for 30 to 45 rounds.",
      "Upon completion, rest in effortless silence, observing the natural cessation of breath without forcing.",
    ],
    contraindications:
      "Avoid during pregnancy, recent abdominal surgery, hernia, uncontrolled hypertension, or glaucoma. Stop immediately if lightheaded.",
  },
  {
    id: "bahya-pranayama",
    name: "Bahya Pranayama",
    sanskritName: "बाह्य प्राणायाम",
    englishName: "External Breath Suspension with Bandhas",
    shortDescription:
      "External breath suspension practiced with the three classical bandhas (locks), directing energy upward into stillness.",
    fullDescription:
      "Bahya Pranayama involves complete exhalation followed by external retention (Bahya Kumbhaka) paired with the application of Jalandhara (throat), Uddiyana (abdominal), and Mula (pelvic floor) bandhas. This advanced technique refines visceral awareness and quiets mental turbulence, but requires grounded preparation and strict gentleness.",
    beginnerFriendly: false,
    difficulty: "Intermediate",
    durationMinutes: 4,
    image: "/images/pranayama/bahya.png",
    articleSlug: "physiology-of-prolonged-exhalation",
    focus: "Visceral Toning & Energy Ascent",
    instructions: [
      "Only practice on an empty stomach in a comfortable, upright seated position.",
      "Take a deep, complete inhalation, then exhale all air smoothly and thoroughly through the nostrils.",
      "Without inhaling, apply Jalandhara Bandha (chin to chest), Uddiyana Bandha (abdomen drawn in and up), and Mula Bandha (pelvic lock).",
      "Hold external suspension for 5 to 10 seconds only—never to the point of strain or air hunger.",
      "Release all three bandhas smoothly, lift the chin, and inhale slowly and gently through the nose.",
    ],
    contraindications:
      "Strictly contraindicated for individuals with hypertension, heart ailments, hernia, peptic ulcers, glaucoma, cervical spondylosis, or during pregnancy. Must never be forced.",
  },
];
