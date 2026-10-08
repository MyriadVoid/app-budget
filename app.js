 let etat = {
    salaire: 0,
    charges: [],
    epargne: 0,
    depenses: []
  };

  function sauvegarder() {
    localStorage.setItem("budget-etat", JSON.stringify(etat));
  }

  function charger() {
    const donnees = localStorage.getItem("budget-etat");
    if (donnees) {
      etat = JSON.parse(donnees);
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
    return etat.salaire - totalCharges() - etat.epargne - totalDepenses();
  }

   function totalCharges() {
    return etat.charges.reduce((somme, c) => somme + c.montant, 0);
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
    const resteDebutJournee = etat.salaire - totalCharges() - etat.epargne - totalDepensesAvantAujourdhui();
    const jours = joursRestants();
    return resteDebutJournee / jours;
  }

  function calculerBudgetJour() {
    return calculerBudgetDebutJournee() - totalDepensesAujourdhui();
  }

  function mettreAJourAffichage() {
    document.getElementById("valeur-salaire").textContent = etat.salaire;
    document.getElementById("valeur-charges").textContent = totalCharges().toFixed(2);
    document.getElementById("valeur-epargne").textContent = etat.epargne;
    document.getElementById("valeur-reste").textContent = calculerReste().toFixed(2);
    const budgetJour = calculerBudgetJour();
    const budgetJourEl = document.getElementById("valeur-budget-jour");
    budgetJourEl.textContent = budgetJour.toFixed(2);
    budgetJourEl.classList.toggle("negatif", budgetJour < 0);

    document.getElementById("badge-budget-depart").textContent =
      "Départ : " + calculerBudgetDebutJournee().toFixed(2) + " €";

    const listeCharges = document.getElementById("liste-charges");
    listeCharges.innerHTML = "";
    etat.charges.forEach((c, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="depense-info">
          <span>${c.nom}</span>
          <span>${c.montant.toFixed(2)} €</span>
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
    etat.depenses.forEach((d, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="depense-info">
          <span>${d.date}</span>
          <span>${d.montant.toFixed(2)} €</span>
        </div>
        <button class="btn-supprimer" data-index="${index}">✕</button>
      `;
      liste.appendChild(li);
    });

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

    etat.salaire = salaire;
    etat.epargne = epargne;
    etat.depenses = [];

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

  charger();
  mettreAJourAffichage();