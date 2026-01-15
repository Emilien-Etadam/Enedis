# 🎯 Guide : Télécharger et fusionner vos données Enedis

**Le script v6.0 télécharge automatiquement vos données en UN SEUL fichier.** Plus besoin de gérer 21 fichiers séparés !

---

## ✅ **Solution 1 : Téléchargement direct (v6.0)**

### 🚀 **La solution recommandée : 1 seul fichier téléchargé automatiquement !**

#### **Installation / Mise à jour vers v6.0**
1. Aller sur https://github.com/Emilien-Etadam/Enedis
2. Cliquer sur `enedis-downloader-tampermonkey.user.js`
3. Cliquer sur "Raw"
4. Tampermonkey proposera l'installation ou la mise à jour → **"Installer"** ou **"Mettre à jour"**

#### **Utilisation**
1. Sur le site Enedis, **panneau en haut à droite**
2. Configurer vos dates avec **"⚙️ Modifier les dates"**
3. Cliquer sur **"📄 Télécharger"**
4. **UN SEUL** fichier Excel sera téléchargé avec toute votre période !

#### **Avantages**
- ✅ **Instantané** : Téléchargement direct depuis l'API Enedis
- ✅ **1 seul fichier** : Plus besoin de fusionner !
- ✅ **Interface simplifiée** : Pas de choix de mode, ça marche directement
- ✅ **Période complète** : Toutes vos données en un clic

#### **Limites**
- ⚠️ Enedis peut limiter la taille selon votre période
- ⚠️ Pour les très longues périodes (>1 an), utilisez plusieurs téléchargements

---

## ✅ **Solution 2 : Fusionner des fichiers existants**

### 📊 **Utilisez l'outil `fusion.html` (déjà dans le projet)**

#### **Étape 1 : Ouvrir fusion.html**
1. Aller dans le dossier du projet
2. **Double-cliquer** sur `fusion.html`
3. Ou ouvrir avec votre navigateur (Chrome/Firefox/Edge)

#### **Étape 2 : Glisser-déposer vos fichiers**
1. **Décompresser le ZIP** si vous avez téléchargé en mode ZIP
2. **Sélectionner vos 21 fichiers** Excel :
   - `Enedis_2024-05-01_2024-05-07.xlsx`
   - `Enedis_2024-05-07_2024-05-13.xlsx`
   - ... (tous les 21 fichiers)
3. **Glisser-déposer** dans la zone de l'outil
   
   ```
   📁 Déposez vos fichiers Excel Enedis ici
   ou cliquez pour sélectionner des fichiers
   ```

#### **Étape 3 : Cliquer sur "Consolider"**
1. Cliquer sur **"🚀 Consolider les fichiers"**
2. L'outil va :
   - ✅ Lire tous les fichiers
   - ✅ Détecter et supprimer les doublons (chevauchements)
   - ✅ Vérifier la continuité des données
   - ✅ Analyser les valeurs manquantes (NA)
   - ✅ Calculer les consommations mensuelles et hebdomadaires

#### **Étape 4 : Télécharger le résultat**
1. Une fois terminé, cliquer sur **"📥 Télécharger le fichier consolidé"**
2. Vous obtenez : **`Consommation_Consolidee.xlsx`**

#### **Résultat**
Un fichier Excel avec :
- **Feuille 1** : "Consommation Consolidée" → Toutes vos données fusionnées
- **Feuille 2** : "Chevauchements" (si détectés) → Les doublons trouvés

---

## 🔍 **Comparaison des 2 solutions**

| Critère | 📄 Téléchargement v6.0 | 📊 Fusion avec `fusion.html` |
|---------|-------------------------|------------------------------|
| **Rapidité** | ⚡ Instantané | ⏱️ ~30 secondes |
| **Facilité** | ✅ 1 clic | ✅ Glisser-déposer |
| **Résultat** | 1 fichier Excel | 1 fichier Excel |
| **Vérifications** | ❌ Aucune | ✅ Doublons, NA, gaps |
| **Statistiques** | ❌ Non | ✅ Conso mensuelle/hebdo |
| **Période max** | ⚠️ Selon API Enedis | ✅ Illimitée |
| **Fichiers requis** | 0 (télécharge direct) | Fichiers déjà téléchargés |

---

## 🎯 **Quelle solution choisir ?**

### **Utilisez le téléchargement v6.0 si :**
- ✅ Vous n'avez **pas encore téléchargé** les fichiers
- ✅ Vous voulez le résultat **le plus rapide** possible
- ✅ Vous voulez **juste les données brutes**

### **Utilisez `fusion.html` si :**
- ✅ Vous avez **déjà plusieurs fichiers** téléchargés
- ✅ Vous voulez des **statistiques détaillées**
- ✅ Vous voulez **vérifier la qualité** des données (NA, gaps, doublons)
- ✅ Vous avez des fichiers de **sources différentes** à consolider

---

## 📋 **Recommandation générale**

### **🏆 Solution recommandée : Téléchargement direct v6.0**

**Pourquoi ?**
- ✅ Téléchargement instantané (pas de ZIP, pas de timeout)
- ✅ Résultat immédiat : 1 seul fichier Excel
- ✅ Interface simplifiée : pas de mode à choisir

**Comment ?**
```
1. Installer/mettre à jour vers v6.0 (voir instructions ci-dessus)
2. Configurer vos dates avec "⚙️ Modifier les dates"
3. Cliquer sur "📄 Télécharger"
4. Attendre 2-3 secondes
5. Fichier téléchargé : Enedis_[date_debut]_[date_fin].xlsx
```

---

## 🆘 **Aide supplémentaire**

### **Le téléchargement ne fonctionne pas ?**
Erreurs possibles :
- **"Fichier trop volumineux"** → Réduisez la période ou téléchargez en plusieurs fois
- **"Erreur de téléchargement"** → Vérifiez que vos IDs sont bien détectés
- **"IDs manquants"** → Utilisez "✏️ Saisie manuelle" pour entrer vos IDs

### **L'outil fusion.html ne fonctionne pas ?**
Vérifications :
- ✅ Ouvrir avec un navigateur moderne (Chrome/Firefox/Edge)
- ✅ Les fichiers doivent contenir `_Export_courbe_de_charge_Consommation_` dans le nom
- ✅ Format : `.xlsx` (Excel)

### **Questions ?**
- 💬 Ouvrir une issue sur GitHub
- 📖 Consulter le [README](./README.md)

---

**Dernière mise à jour** : 2026-01-15
**Version du script** : 6.0 (Téléchargement fichier unique)
**Créé avec ❤️ pour simplifier l'exploitation de vos données Enedis**
