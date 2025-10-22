/**
 * Script pour configurer une tâche CRON de régénération des vies
 * Ce script peut être utilisé avec Vercel Cron Jobs ou d'autres services de planification
 */

const CRON_CONFIG = {
  // Toutes les heures
  schedule: "0 * * * *",
  endpoint: "/api/cron/regenerate-lives",
  description: "Régénération automatique des vies utilisateur"
};

console.log("Configuration de tâche CRON pour la régénération des vies");
console.log("=".repeat(60));
console.log(`Planification: ${CRON_CONFIG.schedule} (toutes les heures)`);
console.log(`Endpoint: ${CRON_CONFIG.endpoint}`);
console.log(`Description: ${CRON_CONFIG.description}`);
console.log("");

console.log("Pour Vercel, ajoutez ceci à votre vercel.json:");
console.log(JSON.stringify({
  crons: [
    {
      path: CRON_CONFIG.endpoint,
      schedule: CRON_CONFIG.schedule
    }
  ]
}, null, 2));

console.log("");
console.log("Variables d'environnement requises:");
console.log("- CRON_SECRET: Clé secrète pour sécuriser l'endpoint CRON");

console.log("");
console.log("Test manuel en développement:");
console.log(`GET http://localhost:3000${CRON_CONFIG.endpoint}`);

// Si exécuté avec Node.js, tester la connexion
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  const testCronEndpoint = async () => {
    try {
      const response = await fetch(`http://localhost:3000${CRON_CONFIG.endpoint}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("");
        console.log("✅ Test réussi:");
        console.log(result);
      } else {
        console.log("");
        console.log("❌ Test échoué:", response.status, response.statusText);
      }
    } catch (error) {
      console.log("");
      console.log("❌ Erreur de connexion:", error.message);
      console.log("Assurez-vous que le serveur de développement est démarré");
    }
  };

  // Attendre un peu pour que le serveur démarre si nécessaire
  setTimeout(testCronEndpoint, 1000);
}
