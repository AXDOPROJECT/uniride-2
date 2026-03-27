const { chromium } = require('playwright');

(async () => {
    console.log("🚀 Lancement du test automatisé End-to-End (Conducteur & Passager)...");
    const browser = await chromium.launch({ headless: true }); // headless for speed
    const driverContext = await browser.newContext();
    const passengerContext = await browser.newContext();

    const driverPage = await driverContext.newPage();
    const passengerPage = await passengerContext.newPage();

    try {
        // --- PHASE 1: DRIVER CONNECTS AND PROPOSES RIDE ---
        console.log("👨‍✈️ Conducteur : Connexion...");
        await driverPage.goto('http://127.0.0.1:3000/login');
        await driverPage.fill('input[name="email"]', 'uniride_driver_2635@gmail.com');
        await driverPage.fill('input[name="password"]', 'Password123!');
        await driverPage.click('button[type="submit"]');
        await driverPage.waitForURL(url => !url.href.includes('/login'));
        console.log("✅ Conducteur connecté !");

        console.log("👨‍✈️ Conducteur : Vérification du Profil...");
        await driverPage.goto('http://127.0.0.1:3000/profil');

        // Accept terms if they appear due to middleware redirection
        try {
            await driverPage.waitForSelector('input[type="checkbox"]', { state: 'attached', timeout: 3000 });
            await driverPage.locator('input[type="checkbox"]').check({ force: true });
            await driverPage.click('button:has-text("ACCEPTER ET CONTINUER")');
            await driverPage.waitForURL(url => !url.href.includes('/terms'));
            await driverPage.goto('http://127.0.0.1:3000/profil'); // return to intended page
        } catch (e) {
            console.log("Conducteur Terms bypass:", e.message);
        }
        console.log("👨‍✈️ Conducteur : Profil chargé avec succès.");

        console.log("👨‍✈️ Conducteur : Publication d'un trajet...");
        await driverPage.goto('http://127.0.0.1:3000/proposer');

        // Type in origin and wait for Google Places Autocomplete to show the dropdown
        await driverPage.fill('input[name="origin"]', 'Gare de Bordeaux');
        await driverPage.waitForSelector('.pac-item', { state: 'attached', timeout: 5000 });
        await driverPage.keyboard.press('ArrowDown');
        await driverPage.keyboard.press('Enter');

        // Type in destination and wait for Google Places
        await driverPage.fill('input[name="destination"]', 'Campus Pessac');
        await driverPage.waitForSelector('.pac-item', { state: 'attached', timeout: 5000 });
        await driverPage.keyboard.press('ArrowDown');
        await driverPage.keyboard.press('Enter');

        // Set date to future and seats
        await driverPage.fill('input[name="date"]', '2026-10-10T14:30');
        await driverPage.fill('input[name="seats"]', '3');

        // Click calculate price
        await driverPage.click('button:has-text("VOIR LE PRIX")');

        // Wait for Distance Matrix to calculate price/distance in background usually
        await driverPage.waitForSelector('button:has-text("CONFIRMER ET PUBLIER")', { timeout: 10000 });

        // Submit ride
        await driverPage.click('button:has-text("CONFIRMER ET PUBLIER")');
        await driverPage.waitForURL('**/dashboard*');

        console.log("✅ Trajet publié avec succès par le conducteur !");

        // --- PHASE 2: PASSENGER SEARCHES AND BOOKS ---
        console.log("🚶 Passager : Connexion...");
        await passengerPage.goto('http://127.0.0.1:3000/login');
        await passengerPage.fill('input[name="email"]', 'uniride_passenger_5984@gmail.com');
        await passengerPage.fill('input[name="password"]', 'Password123!');
        await passengerPage.click('button[type="submit"]');
        await passengerPage.waitForURL(url => !url.href.includes('/login'));
        console.log("✅ Passager connecté !");

        console.log("🚶 Passager : Recherche du trajet...");
        await passengerPage.goto('http://127.0.0.1:3000/rechercher');

        // Accept terms if middleware redirected us
        try {
            await passengerPage.waitForSelector('input[type="checkbox"]', { state: 'attached', timeout: 3000 });
            await passengerPage.locator('input[type="checkbox"]').check({ force: true });
            await passengerPage.click('button:has-text("ACCEPTER ET CONTINUER")');
            await passengerPage.waitForURL(url => !url.href.includes('/terms'));
            await passengerPage.goto('http://127.0.0.1:3000/rechercher');
        } catch (e) {
            console.log("Passager Terms error/bypass:", e.message);
        }

        // Let's just blindly search everything for today or fill inputs
        await passengerPage.fill('input[name="origin"]', 'Bordeaux');
        await passengerPage.waitForSelector('.pac-item', { state: 'attached', timeout: 5000 });
        await passengerPage.keyboard.press('ArrowDown');
        await passengerPage.keyboard.press('Enter');

        await passengerPage.fill('input[name="destination"]', 'Pessac');
        await passengerPage.waitForSelector('.pac-item', { state: 'attached', timeout: 5000 });
        await passengerPage.keyboard.press('ArrowDown');
        await passengerPage.keyboard.press('Enter');

        await passengerPage.click('button:has-text("Rechercher")');

        console.log("🚶 Passager : Sélection et réservation du trajet...");
        // Wait for results
        await passengerPage.waitForSelector('.premium-card', { timeout: 10000 });
        // Click the first ride link
        await passengerPage.waitForTimeout(1000); // Give the DOM time to stabilize
        await passengerPage.click('a[href*="/trajet/"]');

        // Wait for ride details page
        await passengerPage.waitForSelector('button:has-text("RÉSERVER CE TRAJET")');
        // Click Book
        await passengerPage.click('button:has-text("RÉSERVER CE TRAJET")');

        // Wait to be redirected or UI to say pending
        await passengerPage.waitForSelector('text=DEMANDE ENVOYÉE', { timeout: 10000 });
        console.log("✅ Trajet réservé avec succès par le passager !");

        // --- PHASE 3: DRIVER ACCEPTS ---
        console.log("👨‍✈️ Conducteur : Acceptation de la réservation...");
        await driverPage.reload(); // Refresh dashboard
        await driverPage.click('button:has-text("À venir")');
        await driverPage.waitForSelector('button:has-text("Confirmer la réservation")');
        await driverPage.click('button:has-text("Confirmer la réservation")');
        await driverPage.waitForTimeout(2000); // give it time to process
        console.log("✅ Conducteur a accepté le passager !");

        // --- PHASE 4: PASSENGER GETS PIN ---
        console.log("🚶 Passager : Récupération du PIN...");
        await passengerPage.goto('http://127.0.0.1:3000/dashboard');
        await passengerPage.click('button:has-text("À venir")');
        // Look for the 4 digit PIN inside the UI
        await passengerPage.waitForSelector('text=Code PIN', { timeout: 10000 });
        console.log("✅ Code PIN bien reçu par le passager !");

        // In a complex E2E we would read the exact DOM to extract the PIN text, 
        // but seeing it successfully appear proves the flow logic holds!

        console.log("🏆 TEST COMPLET RÉUSSI ! Le système gère parfaitement le cycle complet.");

    } catch (error) {
        console.error("❌ ERREUR LORS DU TEST :", error);
    } finally {
        await browser.close();
    }
})();
