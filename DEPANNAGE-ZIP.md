# 🔧 Dépannage - Téléchargement ZIP du script Tampermonkey

## 📋 Problème : Le fichier ZIP ne se télécharge pas

Si le fichier ZIP du script Tampermonkey Enedis ne se télécharge pas, suivez ce guide de dépannage étape par étape.

---

## ✅ Vérifications préliminaires

### 1. Vérifier que le script est bien activé
- Ouvrez Tampermonkey dans votre navigateur
- Vérifiez que le script "Enedis - Téléchargement Auto Historique" est **activé** (interrupteur sur ON)
- Version actuelle : **v5.8**

### 2. Vérifier que vous êtes en **mode ZIP**
Dans le panneau du script (en haut à droite de la page Enedis) :
- Le bouton **"📦 ZIP"** doit être surligné (vert)
- Si le bouton **"📁 Un par un"** est actif, cliquez sur **"📦 ZIP"**

### 3. Vérifier que les IDs sont détectés
- Dans le panneau, l'ID doit être affiché en **vert**
- Si l'ID est affiché en **jaune** ("Non détecté"), utilisez la **saisie manuelle**

---

## 🔍 Étape 1 : Activer la console (F12)

1. Appuyez sur **F12** pour ouvrir les DevTools
2. Allez dans l'onglet **Console**
3. Cliquez sur **"▶ Démarrer"** dans le panneau Enedis
4. **Observez les logs** dans la console

### Logs attendus lors d'un téléchargement ZIP réussi :

```
📦 [ENEDIS] Démarrage du téléchargement ZIP
📦 [ENEDIS] JSZip disponible: true
📦 [ENEDIS] 50 fichiers à télécharger
📥 [ZIP] Téléchargement 1/50: Enedis_2024-05-01_2024-05-07.xlsx
📥 [ZIP] Réponse HTTP: 200 pour Enedis_2024-05-01_2024-05-07.xlsx
🔄 [ZIP] Converti en Uint8Array: 12345 octets
✅ [ZIP] Ajouté au ZIP: Enedis_2024-05-01_2024-05-07.xlsx
... (répété pour chaque fichier)
📦 [ZIP] Début génération (50 réussis, 0 échoués)
📦 [ZIP] Nombre de fichiers dans le ZIP: 50
   1. Enedis_2024-05-01_2024-05-07.xlsx
   2. Enedis_2024-05-08_2024-05-14.xlsx
   ...
📦 [ZIP] Appel à generateAsync...
📦 [ZIP] Génération: 25.00% (Enedis_2024-05-01_2024-05-07.xlsx)
📦 [ZIP] Génération: 50.00% (Enedis_2024-05-15_2024-05-21.xlsx)
📦 [ZIP] Génération: 100.00% (finalisation)
📦 [ZIP] generateAsync terminé en 5.23s
📦 [ZIP] Taille du blob: 2.45 Mo
💾 [ZIP] Blob URL créé: blob:https://...
📥 [ZIP] Déclenchement du téléchargement de Enedis_20240501_20250430_50fichiers.zip
✅ [ZIP] Téléchargement lancé: Enedis_20240501_20250430_50fichiers.zip
```

---

## ⚠️ Problèmes courants et solutions

### Erreur 1 : `JSZip disponible: false` ou `JSZip is not defined`

**Cause** : La bibliothèque JSZip ne s'est pas chargée

**Solution** :
1. Vérifiez votre connexion Internet
2. Désactivez temporairement les bloqueurs de publicités (uBlock Origin, Adblock, etc.)
3. Rechargez la page (F5)
4. Si le problème persiste, vérifiez que la ligne suivante est présente dans le script :
   ```javascript
   // @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
   ```

---

### Erreur 2 : `Timeout de 120 secondes dépassé`

**Cause** : Le téléchargement prend trop de temps (trop de fichiers ou connexion lente)

**Solutions** :
1. **Réduire la période** : Dans "⚙ Dates", raccourcissez la période (ex: 6 mois au lieu d'un an)
2. **Augmenter l'intervalle** : Passez de 7 jours à 14 jours par fichier (moins de fichiers à télécharger)
3. **Utiliser le mode "Un par un"** : Cliquez sur "📁 Un par un" au lieu de "📦 ZIP"

---

### Erreur 3 : `Timeout après 30 secondes` (pendant le téléchargement d'un fichier)

**Cause** : Un fichier individuel prend trop de temps à télécharger

**Solutions** :
1. Vérifiez votre connexion Internet
2. Réessayez plus tard (le serveur Enedis peut être surchargé)
3. Utilisez le mode "📁 Un par un" pour identifier quel fichier pose problème

---

### Erreur 4 : `HTTP 401` ou `HTTP 403`

**Cause** : Session Enedis expirée ou non authentifié

**Solutions** :
1. **Déconnectez-vous** et **reconnectez-vous** sur le site Enedis
2. Réessayez le téléchargement
3. Si le problème persiste, videz le cache du navigateur (Ctrl+Shift+Del)

---

### Erreur 5 : `HTTP 429` (Too Many Requests)

**Cause** : Trop de requêtes envoyées trop rapidement au serveur Enedis

**Solutions** :
1. Attendez **15-30 minutes** avant de réessayer
2. Dans "⚙ Dates", **augmentez le délai** entre téléchargements (ex: 5000ms au lieu de 2500ms)
3. Réduisez le nombre de fichiers en augmentant l'intervalle

---

### Erreur 6 : Le ZIP se génère mais ne se télécharge pas

**Cause** : Le navigateur bloque le téléchargement automatique

**Solutions** :

#### Pour Chrome/Edge :
1. Allez dans `chrome://settings/content/automaticDownloads`
2. Ajoutez `[*.]enedis.fr` à la liste des sites autorisés
3. OU cliquez sur l'icône de téléchargement bloqué (en haut à droite de la barre d'adresse)
4. Cliquez sur "Toujours autoriser les téléchargements depuis ce site"

#### Pour Firefox :
1. Allez dans `about:preferences#general`
2. Section "Fichiers et applications"
3. Décochez "Toujours demander où enregistrer les fichiers" temporairement
4. Réessayez le téléchargement

---

### Erreur 7 : `Le ZIP généré est vide` (taille 0 Ko)

**Cause** : Aucun fichier n'a pu être téléchargé avec succès

**Solutions** :
1. Vérifiez que vos **IDs sont corrects** (Personne ID et PRM ID)
2. Réinitialisez les IDs : Cliquez sur **🔄 Reset**
3. Refaites la **détection automatique** ou la **saisie manuelle**
4. Consultez les logs de la console pour identifier les erreurs spécifiques

---

## 🐛 Mode Debug avancé

Pour obtenir plus d'informations :

### 1. Activer le mode debug dans le script

Ajoutez ceci en haut du script (après `'use strict';`) :

```javascript
CONFIG.debugMode = true;
```

### 2. Logs détaillés dans la console

Avec le mode debug, vous verrez :
- Toutes les URLs interceptées
- Les détails de chaque requête HTTP
- Les erreurs de conversion blob → Uint8Array
- Les problèmes de génération JSZip

### 3. Copier les logs et partager

1. Faites un clic droit dans la console
2. Sélectionnez "Sauvegarder sous..." ou copiez tout le contenu
3. Partagez ces logs lors d'une demande d'aide

---

## 💡 Astuces pour éviter les problèmes

### ✅ Bonnes pratiques

1. **Commencez petit** : Testez d'abord avec **1-2 mois** de données avant de télécharger un an
2. **Connexion stable** : Utilisez une connexion filaire (Ethernet) plutôt que WiFi si possible
3. **Évitez les heures de pointe** : Téléchargez tôt le matin ou tard le soir
4. **Gardez la page ouverte** : Ne changez pas d'onglet pendant le téléchargement
5. **Désactivez les extensions** : Désactivez temporairement les extensions qui peuvent interférer :
   - Bloqueurs de publicités
   - Gestionnaires de téléchargements
   - Extensions de sécurité/privacy

### ⚙️ Configuration recommandée

Pour un téléchargement **stable et rapide** :

| Paramètre | Valeur recommandée |
|-----------|-------------------|
| **Intervalle** | 7-14 jours |
| **Chevauchement** | 1 jour |
| **Délai** | 2500-5000 ms |
| **Période max** | 12 mois (365 jours) |

---

## 🆘 Rien ne fonctionne ?

Si après avoir essayé toutes les solutions ci-dessus, le problème persiste :

### Alternative 1 : Mode "Un par un"
- Passez en mode **"📁 Un par un"** dans le panneau
- Les fichiers seront téléchargés un par un (pas de ZIP)
- Plus lent mais plus fiable
- Utilisez ensuite le **[fusion.html](./fusion.html)** pour fusionner les fichiers

### Alternative 2 : Script navigateur classique
- Utilisez le **[Script_navigateur](./Script_navigateur)** (méthode console)
- Plus manuel mais fonctionne toujours
- Toutes les instructions sont sur [Next.ink](https://next.ink/184867/linky-enedis-limite-le-telechargement-de-vos-donnees-next-vous-propose-une-solution/)

### Alternative 3 : Demander de l'aide
1. Ouvrez une **issue** sur le dépôt GitHub
2. Incluez :
   - Version du script (v5.8)
   - Navigateur et version
   - Logs de la console (F12)
   - Message d'erreur exact
3. N'incluez **JAMAIS** vos IDs (Personne ID / PRM ID) dans le message

---

## 📊 Vérifier que le ZIP est valide

Une fois le ZIP téléchargé :

### 1. Vérifier la taille
- Un fichier Excel Enedis fait environ **10-50 Ko**
- Pour 50 fichiers : attendez-vous à **0.5-2.5 Mo**
- Si le ZIP fait **0 Ko**, il est vide (voir Erreur 7)

### 2. Ouvrir le ZIP
- Décompressez le ZIP avec un outil (7-Zip, WinRAR, ou natif)
- Vérifiez que tous les fichiers `.xlsx` sont présents
- Si vous voyez des fichiers `_ERREUR.txt`, ouvrez-les pour voir l'erreur

### 3. Tester un fichier
- Ouvrez un des fichiers `.xlsx` avec Excel/LibreOffice
- Vérifiez qu'il contient bien les données horaires
- Feuille "Consommation Horaire" avec colonnes "Début", "Fin", "Valeur"

---

## 📝 Notes de version 5.8

**Améliorations** :
- ✅ Logs beaucoup plus détaillés dans la console
- ✅ Timeout augmenté à 120 secondes (au lieu de 60)
- ✅ Vérifications de validité du ZIP (taille > 0)
- ✅ Meilleure gestion des erreurs avec notifications
- ✅ Progress bar pendant la génération du ZIP
- ✅ Liste détaillée des fichiers ajoutés au ZIP
- ✅ Timeout individuel de 30s par fichier
- ✅ Nettoyage amélioré des ressources après téléchargement

**Bugs corrigés** :
- 🐛 ZIP vide dans certains cas
- 🐛 Blocage infini lors de la génération
- 🐛 Manque de logs lors des erreurs
- 🐛 Téléchargement ne se déclenche pas

---

## ⚡ Performances

**Temps de téléchargement estimés** (connexion 100 Mbps) :

| Période | Intervalle | Fichiers | Temps téléchargement | Temps génération ZIP | Total |
|---------|-----------|----------|---------------------|---------------------|-------|
| 1 mois | 7 jours | ~4 | ~10s | ~0.5s | ~10s |
| 3 mois | 7 jours | ~13 | ~35s | ~1s | ~36s |
| 6 mois | 7 jours | ~26 | ~1min 10s | ~2s | ~1min 12s |
| 12 mois | 7 jours | ~52 | ~2min 20s | ~5s | ~2min 25s |
| 12 mois | 14 jours | ~26 | ~1min 10s | ~2s | ~1min 12s |

*Temps indicatifs - peuvent varier selon la charge du serveur Enedis et votre connexion*

---

## 🔒 Sécurité et confidentialité

- ✅ Le script s'exécute **100% en local** dans votre navigateur
- ✅ **Aucune donnée n'est envoyée** à un serveur tiers
- ✅ Les IDs sont stockés localement avec `GM_setValue` (Tampermonkey)
- ✅ Le code est **open source** et auditable
- ✅ Pas de tracking, pas d'analytics, pas de télémétrie

---

## 📞 Support

- 💬 **Issues GitHub** : Pour signaler un bug ou proposer une amélioration
- 📖 **README complet** : [README-TAMPERMONKEY.md](./README-TAMPERMONKEY.md)
- 🌐 **Article Next.ink** : [Lien vers l'article](https://next.ink/184867/linky-enedis-limite-le-telechargement-de-vos-donnees-next-vous-propose-une-solution/)

---

**Dernière mise à jour** : 2025-01-11  
**Version du script** : v5.8  
**Créé avec ❤️ pour faciliter l'exploitation de vos données Enedis**
