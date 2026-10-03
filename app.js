 let etat = {
    salaire: 0,
    charges: [
      { nom: "Loyer", montant: 585 },
      { nom: "CSS", montant: 365 },
      { nom: "Yallo", montant: 33 },
      { nom: "Unia", montant: 12 },
      { nom: "Tidal", montant: 15 },
      { nom: "Internet", montant: 15 },
      { nom: "Electricité", montant: 11 },
    ],
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

  function calculerBudgetJour() {
    const reste = calculerReste();
    const jours = joursRestants();
    return reste / jours;
  }

  function mettreAJourAffichage() {
    document.getElementById("valeur-salaire").textContent = etat.salaire;
    document.getElementById("valeur-charges").textContent = totalCharges().toFixed(2);
    document.getElementById("valeur-epargne").textContent = etat.epargne;
    document.getElementById("valeur-reste").textContent = calculerReste().toFixed(2);
    document.getElementById("valeur-budget-jour").textContent = calculerBudgetJour().toFixed(2);

    const listeCharges = document.getElementById("liste-charges");
    listeCharges.innerHTML = "";
    etat.charges.forEach(c => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${c.nom}</span><span>${c.montant.toFixed(2)} €</span>`;
      listeCharges.appendChild(li);
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