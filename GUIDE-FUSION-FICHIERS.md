# 🎯 Guide : Fusionner vos 21 fichiers Excel en 1 seul

Vous avez téléchargé 21 fichiers Excel Enedis et vous voulez les fusionner en un seul ? **Vous avez 2 solutions** :

---

## ✅ **Solution 1 : Mode "Fichier unique" (NOUVEAU - v5.11)**

### 🚀 **La plus simple : Téléchargez directement 1 seul fichier !**

#### **Mise à jour vers v5.11**
1. Aller sur https://github.com/Emilien-Etadam/Enedis
2. Cliquer sur `enedis-downloader-tampermonkey.user.js`
3. Cliquer sur "Raw"
4. Tampermonkey proposera la mise à jour → **"Mettre à jour"**

#### **Utilisation**
1. Sur le site Enedis, **panneau en haut à droite**
2. Cliquer sur le bouton **"📄 Unique"** (nouveau mode)
3. Cliquer sur **"▶ Démarrer"**
4. **UN SEUL** fichier Excel sera téléchargé avec toute votre période !

#### **Avantages**
- ✅ **Instantané** : Pas d'attente, pas de génération
- ✅ **1 seul fichier** : Déjà fusionné !
- ✅ **Pas de timeout** : Téléchargement direct depuis Enedis
- ✅ **Pas de ZIP** : Pas besoin de décompresser

#### **Limites**
- ⚠️ Enedis peut limiter la taille : **~6 mois max** recommandé
- ⚠️ Si le fichier est trop gros, Enedis peut refuser

---

## ✅ **Solution 2 : Fusionner vos 21 fichiers existants**

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

| Critère | 📄 Mode "Fichier unique" | 📊 Fusion avec `fusion.html` |
|---------|-------------------------|------------------------------|
| **Rapidité** | ⚡ Instantané | ⏱️ ~30 secondes |
| **Facilité** | ✅ 1 clic | ✅ Glisser-déposer |
| **Résultat** | 1 fichier Excel | 1 fichier Excel |
| **Vérifications** | ❌ Aucune | ✅ Doublons, NA, gaps |
| **Statistiques** | ❌ Non | ✅ Conso mensuelle/hebdo |
| **Période max** | ⚠️ ~6 mois | ✅ Illimitée |
| **Fichiers requis** | 0 (télécharge direct) | 21 fichiers déjà téléchargés |

---

## 🎯 **Quelle solution choisir ?**

### **Utilisez le mode "📄 Fichier unique" si :**
- ✅ Vous n'avez **pas encore téléchargé** les fichiers
- ✅ Votre période est **≤ 6 mois** (ex: 4 mois dans votre cas ✅)
- ✅ Vous voulez le résultat **le plus rapide** possible

### **Utilisez `fusion.html` si :**
- ✅ Vous avez **déjà les 21 fichiers** téléchargés
- ✅ Vous voulez des **statistiques détaillées**
- ✅ Vous voulez **vérifier la qualité** des données (NA, gaps, doublons)
- ✅ Votre période est **> 6 mois** (Enedis peut bloquer les fichiers trop gros)

---

## 📋 **Recommandation pour votre cas**

**Période : 2024-05-01 → 2024-08-30 (4 mois)**

### **🏆 Solution recommandée : Mode "Fichier unique"**

**Pourquoi ?**
- ✅ 4 mois = Largement sous la limite Enedis
- ✅ Téléchargement instantané (pas de ZIP, pas de timeout)
- ✅ Résultat immédiat : 1 seul fichier Excel

**Comment ?**
```
1. Mettre à jour vers v5.11 (voir instructions ci-dessus)
2. Cliquer sur "📄 Unique"
3. Cliquer sur "▶ Démarrer"
4. Attendre 2-3 secondes
5. Fichier téléchargé : Enedis_2024-05-01_2024-08-30.xlsx
```

---

## 🆘 **Aide supplémentaire**

### **Mode "Fichier unique" ne fonctionne pas ?**
Erreurs possibles :
- **"Fichier trop volumineux"** → Enedis bloque, utilisez `fusion.html` à la place
- **"Erreur de téléchargement"** → Réessayez ou utilisez le mode ZIP

### **L'outil fusion.html ne fonctionne pas ?**
Vérifications :
- ✅ Ouvrir avec un navigateur moderne (Chrome/Firefox/Edge)
- ✅ Les fichiers doivent contenir `_Export_courbe_de_charge_Consommation_` dans le nom
- ✅ Format : `.xlsx` (Excel)

### **Questions ?**
- 💬 Ouvrir une issue sur GitHub
- 📖 Consulter le [README](./README.md)
- 🔧 Consulter le [guide de dépannage](./DEPANNAGE-ZIP.md)

---

**Dernière mise à jour** : 2025-01-11  
**Version du script** : 5.11 (Mode fichier unique)  
**Créé avec ❤️ pour simplifier l'exploitation de vos données Enedis**
