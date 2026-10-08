 let etat = {
    salaire: 0,
    charges: [],
    epargnes: [],
    depenses: []
  };

  let modeBadge = localStorage.getItem("budget-mode-badge") || "jour";

  function sauvegarder() {
    localStorage.setItem("budget-etat", JSON.stringify(etat));
  }

  function charger() {
    const donnees = localStorage.getItem("budget-etat");
    if (donnees) {
      etat = JSON.parse(donnees);
      if (!etat.epargnes) {
        etat.epargnes = typeof etat.epargne === "number"
          ? [{ date: "Avant mise à jour", montant: etat.epargne }]
          : [];
      }
    }
  }

  function dateFinCycle() {
    const aujourdhui = new Date();
    const jour = aujourdhui.getDate();

    if (jour >= 28) {
      return new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 27);
    } else {
      return new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 27);
    }
  }

  function joursRestants() {
    const aujourdhui = new Date();
    const fin = dateFinCycle();

    aujourdhui.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diffMs = fin - aujourdhui;
    const diffJours = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffJours + 1; // +1 pour inclure aujourd'hui
  }

   function totalDepenses() {
    return etat.depenses.reduce((somme, d) => somme + d.montant, 0);
  }

  function calculerReste() {
    return etat.salaire - totalCharges() - totalEpargne() - totalDepenses();
  }

   function totalCharges() {
    return etat.charges.reduce((somme, c) => somme + c.montant, 0);
  }

  function totalEpargne() {
    return etat.epargnes.reduce((somme, e) => somme + e.montant, 0);
  }

  function dateAujourdhuiStr() {
    return new Date().toLocaleDateString("fr-FR");
  }

  function totalDepensesAujourdhui() {
    const aujourdhui = dateAujourdhuiStr();
    return etat.depenses
      .filter(d => d.date === aujourdhui)
      .reduce((somme, d) => somme + d.montant, 0);
  }

  function totalDepensesAvantAujourdhui() {
    const aujourdhui = dateAujourdhuiStr();
    return etat.depenses
      .filter(d => d.date !== aujourdhui)
      .reduce((somme, d) => somme + d.montant, 0);
  }

  function calculerBudgetDebutJournee() {
    const resteDebutJournee = etat.salaire - totalCharges() - totalEpargne() - totalDepensesAvantAujourdhui();
    const jours = joursRestants();
    return resteDebutJournee / jours;
  }

  function calculerBudgetJour() {
    return calculerBudgetDebutJournee() - totalDepensesAujourdhui();
  }

  function calculerBudgetSemaine() {
    const projection = calculerBudgetDebutJournee() * 7;
    const reste = calculerReste();
    return Math.min(projection, reste);
  }

  function mettreAJourAffichage() {
    document.getElementById("valeur-salaire").textContent = etat.salaire;
    document.getElementById("valeur-charges").textContent = totalCharges().toFixed(2);
    document.getElementById("valeur-epargne").textContent = totalEpargne().toFixed(2);
    document.getElementById("valeur-reste").textContent = calculerReste().toFixed(2);
    const budgetJour = calculerBudgetJour();
    const budgetDebutJournee = calculerBudgetDebutJournee();
    const budgetJourEl = document.getElementById("valeur-budget-jour");
    const labelBudgetEl = document.getElementById("label-budget-jour");

    let valeurAffichee;
    if (modeBadge === "semaine") {
      labelBudgetEl.textContent = "Budget de la semaine";
      valeurAffichee = calculerBudgetSemaine();
    } else {
      labelBudgetEl.textContent = "Budget du jour";
      valeurAffichee = budgetJour;
    }
    budgetJourEl.textContent = valeurAffichee.toFixed(2);
    document.getElementById("valeur-budget-jour-wrapper").classList.toggle("negatif", valeurAffichee < 0);

    const badgeEl = document.getElementById("badge-budget-depart");
    if (modeBadge === "semaine") {
      badgeEl.textContent = calculerBudgetSemaine().toFixed(2) + " CHF";
    } else {
      badgeEl.textContent = budgetDebutJournee.toFixed(2) + " CHF";
    }

    const listeEpargne = document.getElementById("liste-epargne");
    listeEpargne.innerHTML = "";
    etat.epargnes.forEach((e, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="depense-info">
          <span>${e.date}</span>
          <span>${e.montant.toFixed(2)} CHF</span>
        </div>
        <button class="btn-supprimer-epargne" data-index="${index}">✕</button>
      `;
      listeEpargne.appendChild(li);
    });

    document.querySelectorAll(".btn-supprimer-epargne").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        etat.epargnes.splice(index, 1);
        sauvegarder();
        mettreAJourAffichage();
      });
    });

    const listeCharges = document.getElementById("liste-charges");
    listeCharges.innerHTML = "";
    etat.charges.forEach((c, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="depense-info">
          <span>${c.nom}</span>
          <span>${c.montant.toFixed(2)} CHF</span>
        </div>
        <button class="btn-supprimer-charge" data-index="${index}">✕</button>
      `;
      listeCharges.appendChild(li);
    });

    document.querySelectorAll(".btn-supprimer-charge").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        etat.charges.splice(index, 1);
        sauvegarder();
        mettreAJourAffichage();
      });
    });

    const liste = document.getElementById("liste-depenses");
    liste.innerHTML = "";
    for (let index = etat.depenses.length - 1; index >= 0; index--) {
      const d = etat.depenses[index];
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="depense-info">
          <span>${d.date}</span>
          <span>${d.montant.toFixed(2)} CHF</span>
        </div>
        <button class="btn-supprimer" data-index="${index}">✕</button>
      `;
      liste.appendChild(li);
    }

    document.querySelectorAll(".btn-supprimer").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        etat.depenses.splice(index, 1);
        sauvegarder();
        mettreAJourAffichage();
      });
    });
  }

   document.getElementById("btn-valider-mois").addEventListener("click", () => {
    const salaire = parseFloat(document.getElementById("input-salaire").value);
    const epargne = parseFloat(document.getElementById("input-epargne").value);

    if (isNaN(salaire) || isNaN(epargne)) {
      alert("Merci de remplir le salaire et l'épargne.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("fr-FR");

    etat.salaire = salaire;
    etat.epargnes = [{ date: dateStr, montant: epargne }];
    etat.depenses = [];

    sauvegarder();
    mettreAJourAffichage();
  });

  document.getElementById("btn-ajouter-epargne").addEventListener("click", () => {
    const inputMontant = document.getElementById("input-montant-epargne");
    const montant = parseFloat(inputMontant.value);

    if (isNaN(montant)) {
      alert("Entre un montant valide.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("fr-FR");
    etat.epargnes.push({ date: dateStr, montant });

    inputMontant.value = "";
    sauvegarder();
    mettreAJourAffichage();
  });

  document.getElementById("btn-ajouter-depense").addEventListener("click", () => {
    const inputDepense = document.getElementById("input-depense");
    const montant = parseFloat(inputDepense.value);

    if (isNaN(montant) || montant < 0) {
      alert("Merci d'entrer un montant valide (0 si rien dépensé).");
      return;
    }

    const dateStr = new Date().toLocaleDateString("fr-FR");
    etat.depenses.push({ date: dateStr, montant: montant });

    inputDepense.value = "";
    sauvegarder();
    mettreAJourAffichage();
  });

  document.getElementById("btn-ajouter-charge").addEventListener("click", () => {
    const inputNom = document.getElementById("input-nom-charge");
    const inputMontant = document.getElementById("input-montant-charge");
    const nom = inputNom.value.trim();
    const montant = parseFloat(inputMontant.value);

    if (!nom || isNaN(montant)) {
      alert("Entre un nom et un montant valides.");
      return;
    }

    etat.charges.push({ nom, montant });

    inputNom.value = "";
    inputMontant.value = "";
    sauvegarder();
    mettreAJourAffichage();
  });

  document.getElementById("btn-ajuster-solde").addEventListener("click", () => {
    const inputSolde = document.getElementById("input-solde-reel");
    const soldeReel = parseFloat(inputSolde.value);

    if (isNaN(soldeReel)) {
      alert("Entre le solde affiché sur ton compte.");
      return;
    }

    const correction = calculerReste() - soldeReel;
    const dateStr = new Date().toLocaleDateString("fr-FR");
    etat.depenses.push({ date: `Ajustement (${dateStr})`, montant: correction });

    inputSolde.value = "";
    sauvegarder();
    mettreAJourAffichage();
  });

  const iconeSoleil = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

  const iconeLune = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function appliquerTheme() {
    const theme = localStorage.getItem("budget-theme") || "sombre";
    document.body.classList.toggle("light", theme === "clair");
    document.getElementById("btn-theme").innerHTML = theme === "sombre" ? iconeSoleil : iconeLune;
  }

  document.getElementById("btn-theme").addEventListener("click", () => {
    const themeActuel = localStorage.getItem("budget-theme") || "sombre";
    const nouveauTheme = themeActuel === "sombre" ? "clair" : "sombre";
    localStorage.setItem("budget-theme", nouveauTheme);
    appliquerTheme();
  });

  document.getElementById("badge-budget-depart").addEventListener("click", () => {
    modeBadge = modeBadge === "jour" ? "semaine" : "jour";
    localStorage.setItem("budget-mode-badge", modeBadge);
    mettreAJourAffichage();
  });

  appliquerTheme();
  charger();
  mettreAJourAffichage();