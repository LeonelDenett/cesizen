import { db } from "./index";
import {
  users,
  emotionsLevel1,
  emotionsLevel2,
  infoPages,
  menuItems,
  emotionLogs,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const LEVEL1_EMOTIONS = [
  { name: "Joie", displayOrder: 1 },
  { name: "Colère", displayOrder: 2 },
  { name: "Peur", displayOrder: 3 },
  { name: "Tristesse", displayOrder: 4 },
  { name: "Surprise", displayOrder: 5 },
  { name: "Dégoût", displayOrder: 6 },
];

const LEVEL2_EMOTIONS: Record<string, string[]> = {
  Joie: ["Fierté", "Contentement", "Enchantement", "Excitation", "Émerveillement", "Gratitude"],
  Colère: ["Frustration", "Irritation", "Rage", "Ressentiment", "Agacement", "Hostilité"],
  Peur: ["Inquiétude", "Anxiété", "Terreur", "Appréhension", "Panique", "Crainte"],
  Tristesse: ["Chagrin", "Mélancolie", "Abattement", "Désespoir", "Solitude", "Dépression"],
  Surprise: ["Étonnement", "Stupéfaction", "Sidération", "Incrédule", "Émerveillement", "Confusion"],
  Dégoût: ["Répulsion", "Déplaisir", "Nausée", "Dédain", "Horreur", "Dégoût profond"],
};

const INFO_PAGES_DATA = [
  // ── Stress (existants) ──
  {
    title: "Qu'est-ce que le stress ?",
    slug: "quest-ce-que-le-stress",
    category: "stress" as const,
    content: `Le stress est une réaction naturelle de l'organisme face à une situation perçue comme menaçante ou exigeante. Il peut être positif (eustress) lorsqu'il nous motive, ou négatif (détresse) lorsqu'il devient chronique.\n\n## Les symptômes du stress\n\n- Tensions musculaires\n- Troubles du sommeil\n- Irritabilité\n- Difficultés de concentration\n- Fatigue persistante\n\n## Comment gérer le stress ?\n\n1. **Respiration profonde** : Prenez 5 minutes pour respirer lentement\n2. **Activité physique** : 30 minutes de marche par jour\n3. **Sommeil régulier** : Couchez-vous à heure fixe\n4. **Alimentation équilibrée** : Évitez les excitants\n5. **Parlez-en** : N'hésitez pas à consulter un professionnel`,
    status: "published" as const,
  },
  {
    title: "La gestion des émotions",
    slug: "la-gestion-des-emotions",
    category: "general" as const,
    content: `Les émotions sont des réactions naturelles qui nous informent sur notre état intérieur. Apprendre à les reconnaître et les gérer est essentiel pour notre bien-être.\n\n## Les 6 émotions de base\n\n- **Joie** : Sentiment de bonheur et de satisfaction\n- **Colère** : Réaction face à une injustice ou frustration\n- **Peur** : Signal d'alerte face à un danger\n- **Tristesse** : Réponse à une perte ou déception\n- **Surprise** : Réaction à l'inattendu\n- **Dégoût** : Rejet de ce qui est perçu comme nuisible\n\n## Techniques de régulation émotionnelle\n\n1. **Identifier l'émotion** : Nommez ce que vous ressentez\n2. **Accepter l'émotion** : Ne la jugez pas\n3. **Comprendre le déclencheur** : Qu'est-ce qui a provoqué cette émotion ?\n4. **Choisir une réponse adaptée** : Respirez, parlez, écrivez`,
    status: "published" as const,
  },
  {
    title: "Prévention du burn-out",
    slug: "prevention-du-burn-out",
    category: "stress" as const,
    content: `Le burn-out, ou syndrome d'épuisement professionnel, est un état de fatigue intense lié au travail. Il se développe progressivement et peut avoir des conséquences graves sur la santé.\n\n## Les signes d'alerte\n\n- Épuisement émotionnel et physique\n- Cynisme et détachement\n- Sentiment d'inefficacité\n- Troubles du sommeil chroniques\n- Isolement social\n\n## Prévention\n\n1. **Fixez des limites** : Apprenez à dire non\n2. **Prenez des pauses** : Déconnectez régulièrement\n3. **Cultivez vos loisirs** : Gardez du temps pour vous\n4. **Parlez à votre entourage** : Ne restez pas seul(e)\n5. **Consultez** : Un professionnel peut vous aider`,
    status: "published" as const,
  },
  {
    title: "Ressources et numéros utiles",
    slug: "ressources-et-numeros-utiles",
    category: "general" as const,
    content: `Si vous traversez une période difficile, n'hésitez pas à contacter ces services d'aide :\n\n## Numéros d'urgence\n\n- **3114** : Numéro national de prévention du suicide (24h/24)\n- **0 800 130 000** : Fil Santé Jeunes (anonyme et gratuit)\n- **01 45 39 40 00** : Suicide Écoute (24h/24)\n\n## Sites web utiles\n\n- Psycom : Information sur la santé mentale\n- Santé publique France : Données et prévention\n\n## En cas d'urgence\n\nAppelez le **15** (SAMU) ou le **112** (numéro d'urgence européen).`,
    status: "published" as const,
  },
  // ── Alimentation ──
  {
    title: "Alimentation et santé mentale",
    slug: "alimentation-et-sante-mentale",
    category: "alimentation" as const,
    content: `Ce que nous mangeons influence directement notre humeur et notre bien-être mental. Une alimentation équilibrée est un pilier fondamental de la santé mentale.\n\n## Les nutriments clés\n\n- **Oméga-3** : Présents dans les poissons gras, noix et graines de lin. Ils réduisent l'inflammation cérébrale.\n- **Magnésium** : Chocolat noir, épinards, amandes. Essentiel pour la régulation du stress.\n- **Vitamines B** : Céréales complètes, légumineuses. Participent à la production de sérotonine.\n- **Tryptophane** : Bananes, dinde, œufs. Précurseur de la sérotonine.\n\n## Conseils pratiques\n\n1. Mangez des repas réguliers pour stabiliser la glycémie\n2. Privilégiez les aliments complets et non transformés\n3. Hydratez-vous suffisamment (1,5L d'eau par jour)\n4. Limitez la caféine et l'alcool\n5. Intégrez des fruits et légumes colorés à chaque repas`,
    status: "published" as const,
  },
  {
    title: "Les super-aliments anti-stress",
    slug: "super-aliments-anti-stress",
    category: "alimentation" as const,
    content: `Certains aliments ont des propriétés reconnues pour réduire le stress et améliorer l'humeur.\n\n## Top 10 des aliments anti-stress\n\n1. **Avocat** : Riche en vitamines B et potassium\n2. **Myrtilles** : Antioxydants puissants qui protègent le cerveau\n3. **Saumon** : Oméga-3 pour la santé cérébrale\n4. **Chocolat noir (70%+)** : Stimule la production d'endorphines\n5. **Épinards** : Magnésium et folates\n6. **Noix** : Oméga-3 et mélatonine naturelle\n7. **Thé vert** : L-théanine pour la relaxation\n8. **Banane** : Tryptophane et vitamine B6\n9. **Yaourt** : Probiotiques pour l'axe intestin-cerveau\n10. **Curcuma** : Anti-inflammatoire naturel\n\n## Recette zen\n\nSmoothie anti-stress : 1 banane + poignée de myrtilles + 1 c.à.s. de graines de lin + yaourt nature + miel`,
    status: "published" as const,
  },
  {
    title: "Hydratation et bien-être",
    slug: "hydratation-et-bien-etre",
    category: "alimentation" as const,
    content: `La déshydratation, même légère, peut affecter votre humeur, votre concentration et votre niveau d'énergie.\n\n## Pourquoi l'eau est essentielle\n\n- Le cerveau est composé à 75% d'eau\n- Une déshydratation de 2% réduit les performances cognitives de 20%\n- L'eau aide à éliminer les toxines liées au stress\n\n## Combien boire ?\n\n- **Femmes** : environ 2 litres par jour\n- **Hommes** : environ 2,5 litres par jour\n- Augmentez en cas d'activité physique ou de chaleur\n\n## Astuces pour boire plus\n\n1. Gardez une bouteille d'eau visible sur votre bureau\n2. Ajoutez des tranches de citron ou concombre\n3. Buvez un verre d'eau au réveil\n4. Utilisez une application de rappel\n5. Remplacez une boisson sucrée par jour par de l'eau`,
    status: "published" as const,
  },
  // ── Sport ──
  {
    title: "Sport et santé mentale",
    slug: "sport-et-sante-mentale",
    category: "sport" as const,
    content: `L'activité physique est l'un des remèdes naturels les plus puissants contre le stress, l'anxiété et la dépression.\n\n## Les bienfaits prouvés\n\n- **Endorphines** : L'exercice libère des hormones du bonheur\n- **Cortisol** : L'activité régulière réduit le niveau de cortisol (hormone du stress)\n- **Sommeil** : Le sport améliore la qualité du sommeil\n- **Estime de soi** : Les progrès physiques renforcent la confiance\n\n## Recommandations OMS\n\n- 150 minutes d'activité modérée par semaine\n- Ou 75 minutes d'activité intense\n- Renforcement musculaire 2 fois par semaine\n\n## Par où commencer ?\n\n1. Commencez par 10 minutes de marche par jour\n2. Augmentez progressivement\n3. Choisissez une activité qui vous plaît\n4. Trouvez un partenaire d'entraînement\n5. Fixez-vous des objectifs réalistes`,
    status: "published" as const,
  },
  {
    title: "Le yoga pour débutants",
    slug: "yoga-pour-debutants",
    category: "sport" as const,
    content: `Le yoga combine postures physiques, respiration et méditation. C'est une pratique idéale pour réduire le stress et améliorer la flexibilité.\n\n## 5 postures pour débuter\n\n1. **Posture de l'enfant (Balasana)** : Repos et détente du dos\n2. **Chien tête en bas (Adho Mukha)** : Étirement complet du corps\n3. **Guerrier I (Virabhadrasana)** : Force et équilibre\n4. **Posture de l'arbre (Vrksasana)** : Concentration et stabilité\n5. **Savasana** : Relaxation finale, allongé sur le dos\n\n## Conseils pour débuter\n\n- Pratiquez sur un tapis confortable\n- Portez des vêtements souples\n- Commencez par des séances de 15-20 minutes\n- Respectez vos limites, ne forcez jamais\n- La respiration est plus importante que la posture parfaite`,
    status: "published" as const,
  },
  {
    title: "La marche en pleine nature",
    slug: "marche-en-pleine-nature",
    category: "sport" as const,
    content: `La marche en nature, ou « bain de forêt » (shinrin-yoku), est une pratique thérapeutique reconnue pour ses bienfaits sur la santé mentale.\n\n## Les bienfaits scientifiques\n\n- Réduction du cortisol de 12% après 20 minutes en forêt\n- Baisse de la tension artérielle\n- Amélioration de l'humeur et réduction de l'anxiété\n- Renforcement du système immunitaire\n\n## Comment pratiquer\n\n1. Choisissez un parc ou une forêt proche\n2. Laissez votre téléphone en mode silencieux\n3. Marchez lentement, sans objectif de distance\n4. Observez les couleurs, écoutez les sons\n5. Respirez profondément l'air frais\n6. Touchez les arbres, sentez les fleurs\n\n## Fréquence recommandée\n\n2 à 3 sorties de 30 minutes par semaine suffisent pour ressentir les bienfaits.`,
    status: "published" as const,
  },
  // ── Méditation ──
  {
    title: "Introduction à la méditation",
    slug: "introduction-a-la-meditation",
    category: "meditation" as const,
    content: `La méditation est une pratique millénaire qui consiste à entraîner l'attention et la conscience. Elle est aujourd'hui recommandée par de nombreux professionnels de santé.\n\n## Les types de méditation\n\n- **Pleine conscience (Mindfulness)** : Observer ses pensées sans jugement\n- **Méditation guidée** : Suivre les instructions d'un guide\n- **Méditation transcendantale** : Répétition d'un mantra\n- **Body scan** : Parcourir mentalement chaque partie du corps\n\n## Bienfaits prouvés\n\n- Réduction de l'anxiété de 30% en 8 semaines\n- Amélioration de la concentration\n- Meilleure gestion des émotions\n- Réduction de la douleur chronique\n\n## Comment commencer\n\n1. Asseyez-vous confortablement\n2. Fermez les yeux\n3. Concentrez-vous sur votre respiration\n4. Quand votre esprit divague, ramenez-le doucement\n5. Commencez par 5 minutes, augmentez progressivement`,
    status: "published" as const,
  },
  {
    title: "La respiration consciente",
    slug: "respiration-consciente",
    category: "meditation" as const,
    content: `La respiration consciente est la technique de méditation la plus accessible. Elle peut être pratiquée n'importe où, n'importe quand.\n\n## Technique 4-7-8\n\n1. **Inspirez** par le nez pendant 4 secondes\n2. **Retenez** votre souffle pendant 7 secondes\n3. **Expirez** lentement par la bouche pendant 8 secondes\n4. Répétez 4 cycles\n\n## Technique de cohérence cardiaque\n\n- Inspirez 5 secondes, expirez 5 secondes\n- 6 respirations par minute pendant 5 minutes\n- 3 fois par jour (matin, midi, soir)\n- Résultat : réduction du cortisol pendant 4 à 6 heures\n\n## Quand pratiquer ?\n\n- Au réveil pour bien démarrer la journée\n- Avant une réunion stressante\n- Pendant une pause au travail\n- Avant de dormir pour favoriser l'endormissement`,
    status: "published" as const,
  },
  {
    title: "Méditation et sommeil",
    slug: "meditation-et-sommeil",
    category: "meditation" as const,
    content: `Les troubles du sommeil touchent 1 Français sur 3. La méditation est une solution naturelle et efficace pour retrouver un sommeil réparateur.\n\n## Pourquoi ça marche\n\n- La méditation active le système nerveux parasympathique\n- Elle réduit les ruminations mentales qui empêchent l'endormissement\n- Elle diminue la production de cortisol le soir\n\n## Routine du soir en 4 étapes\n\n1. **30 min avant** : Éteignez les écrans\n2. **15 min avant** : Pratiquez le body scan allongé\n3. **5 min** : Respiration 4-7-8 (3 cycles)\n4. **Lâcher prise** : Laissez vos pensées passer comme des nuages\n\n## Méditation du body scan\n\n- Allongez-vous confortablement\n- Parcourez mentalement votre corps des pieds à la tête\n- À chaque zone, relâchez consciemment les tensions\n- Durée : 10 à 20 minutes\n\nAvec une pratique régulière, la plupart des personnes constatent une amélioration du sommeil en 2 à 3 semaines.`,
    status: "published" as const,
  },
];

export async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // ── 1. Émotions ──
    const insertedLevel1 = await db
      .insert(emotionsLevel1)
      .values(LEVEL1_EMOTIONS)
      .onConflictDoNothing({ target: emotionsLevel1.name })
      .returning();

    console.log(`✅ ${insertedLevel1.length} émotions niveau 1`);

    // If emotions already existed, fetch them
    let allLevel1 = insertedLevel1;
    if (insertedLevel1.length === 0) {
      allLevel1 = await db.select().from(emotionsLevel1);
    }

    for (const l1 of allLevel1) {
      const level2Names = LEVEL2_EMOTIONS[l1.name];
      if (!level2Names) continue;

      const level2Values = level2Names.map((name, index) => ({
        emotionLevel1Id: l1.id,
        name,
        displayOrder: index + 1,
      }));

      await db.insert(emotionsLevel2).values(level2Values).onConflictDoNothing();
    }
    console.log("✅ Émotions niveau 2");

    // ── 2. Utilisateurs ──
    const adminHash = await bcrypt.hash("Admin123!", 10);
    const userHash = await bcrypt.hash("User1234", 10);

    await db
      .insert(users)
      .values({
        name: "Administrateur",
        email: "admin@cesizen.fr",
        passwordHash: adminHash,
        role: "administrateur",
      })
      .onConflictDoNothing({ target: users.email });

    const [demoUser] = await db
      .insert(users)
      .values({
        name: "Marie Dupont",
        email: "marie@cesizen.fr",
        passwordHash: userHash,
        role: "utilisateur",
      })
      .onConflictDoNothing({ target: users.email })
      .returning();

    console.log("✅ Utilisateurs (admin@cesizen.fr / Admin123!, marie@cesizen.fr / User1234)");

    // ── 3. Pages d'information ──
    const existingPages = await db.select().from(infoPages);
    if (existingPages.length === 0) {
      const insertedPages = await db
        .insert(infoPages)
        .values(INFO_PAGES_DATA)
        .returning();

      console.log(`✅ ${insertedPages.length} pages d'information`);

      // ── 4. Menu items ──
      const menuLabels: Record<string, string> = {
        "Qu'est-ce que le stress ?": 'Stress',
        'La gestion des émotions': 'Émotions',
        'Prévention du burn-out': 'Burn-out',
        'Ressources et numéros utiles': 'Ressources',
      };

      const menuValues = insertedPages.map((page, index) => ({
        label: menuLabels[page.title] || page.title,
        pageId: page.id,
        displayOrder: index + 1,
      }));

      await db.insert(menuItems).values(menuValues);
      console.log(`✅ ${menuValues.length} éléments de menu`);
    } else {
      console.log("⏭️  Pages d'information déjà existantes");
    }

    // ── 5. Entrées du tracker (données de démo) ──
    // Get the demo user (might have been created in a previous run)
    let trackerUserId = demoUser?.id;
    if (!trackerUserId) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, "marie@cesizen.fr"))
        .limit(1);
      trackerUserId = existing?.id;
    }

    if (trackerUserId) {
      const existingLogs = await db
        .select()
        .from(emotionLogs)
        .where(eq(emotionLogs.userId, trackerUserId))
        .limit(1);

      if (existingLogs.length === 0) {
        // Fetch all level2 emotions with their level1 parent
        const allL2 = await db.select().from(emotionsLevel2);
        const allL1 = await db.select().from(emotionsLevel1);

        const l1Map = new Map(allL1.map((l) => [l.name, l.id]));
        const l2ByParent = new Map<string, typeof allL2>();
        for (const l2 of allL2) {
          const list = l2ByParent.get(l2.emotionLevel1Id) || [];
          list.push(l2);
          l2ByParent.set(l2.emotionLevel1Id, list);
        }

        // Generate 30 days of emotion entries
        const now = new Date();
        const entries = [];

        const emotionSequence = [
          { l1: "Joie", l2idx: 0, note: "Belle journée ensoleillée" },
          { l1: "Peur", l2idx: 1, note: "Examen demain, un peu stressée" },
          { l1: "Joie", l2idx: 2, note: "Réussi mon examen !" },
          { l1: "Tristesse", l2idx: 0, note: "Mon ami est parti" },
          { l1: "Colère", l2idx: 0, note: "Retard de bus, encore..." },
          { l1: "Joie", l2idx: 3, note: "Sortie entre amis" },
          { l1: "Surprise", l2idx: 0, note: "Cadeau inattendu" },
          { l1: "Peur", l2idx: 2, note: null },
          { l1: "Joie", l2idx: 1, note: "Promenade au parc" },
          { l1: "Tristesse", l2idx: 1, note: "Journée pluvieuse et mélancolique" },
          { l1: "Colère", l2idx: 1, note: "Conflit au travail" },
          { l1: "Joie", l2idx: 5, note: "Reconnaissante pour ma famille" },
          { l1: "Dégoût", l2idx: 1, note: null },
          { l1: "Surprise", l2idx: 5, note: "Perdue dans mes pensées" },
          { l1: "Joie", l2idx: 0, note: "Promotion au travail !" },
          { l1: "Peur", l2idx: 0, note: "Inquiète pour l'avenir" },
          { l1: "Joie", l2idx: 4, note: "Coucher de soleil magnifique" },
          { l1: "Colère", l2idx: 4, note: "Voisins bruyants" },
          { l1: "Tristesse", l2idx: 4, note: "Sentiment de solitude" },
          { l1: "Joie", l2idx: 1, note: "Bon repas en famille" },
          { l1: "Peur", l2idx: 3, note: "Présentation orale demain" },
          { l1: "Joie", l2idx: 3, note: "La présentation s'est bien passée" },
          { l1: "Surprise", l2idx: 0, note: "Rencontre inattendue" },
          { l1: "Tristesse", l2idx: 2, note: "Fatiguée et abattue" },
          { l1: "Joie", l2idx: 0, note: "Fière de mes progrès" },
          { l1: "Colère", l2idx: 2, note: null },
          { l1: "Joie", l2idx: 1, note: "Journée calme et agréable" },
          { l1: "Peur", l2idx: 4, note: "Moment de panique dans le métro" },
          { l1: "Joie", l2idx: 2, note: "Film enchanteur au cinéma" },
          { l1: "Surprise", l2idx: 1, note: "Nouvelle complètement inattendue" },
        ];

        for (let i = 0; i < emotionSequence.length; i++) {
          const { l1, l2idx, note } = emotionSequence[i];
          const l1Id = l1Map.get(l1);
          if (!l1Id) continue;

          const l2List = l2ByParent.get(l1Id);
          if (!l2List || l2List.length === 0) continue;

          const l2 = l2List[l2idx % l2List.length];
          const logDate = new Date(now);
          logDate.setDate(logDate.getDate() - (emotionSequence.length - i));

          entries.push({
            userId: trackerUserId,
            emotionLevel1Id: l1Id,
            emotionLevel2Id: l2.id,
            logDate,
            note,
          });
        }

        await db.insert(emotionLogs).values(entries);
        console.log(`✅ ${entries.length} entrées du tracker (marie@cesizen.fr)`);
      } else {
        console.log("⏭️  Entrées du tracker déjà existantes");
      }
    }

    console.log("🌱 Seeding terminé !");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}

seed().then(() => process.exit(0));
