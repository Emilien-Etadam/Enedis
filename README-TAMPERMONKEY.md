# 🔌 Enedis Downloader - Script Tampermonkey

Script automatique pour télécharger facilement vos données de consommation Enedis en **un seul fichier**.

> **🆕 Version 6.0** : Interface épurée, téléchargement fichier unique simplifié
> **🎯 Nouveauté** : Plus besoin de gérer plusieurs fichiers, tout est téléchargé en un seul fichier Excel !

## ✨ Fonctionnalités

- ✅ **Téléchargement fichier unique** : toute votre période en un seul fichier Excel
- ✅ **Détection automatique** des identifiants (personneId, prmId)
- ✅ **Interface graphique** épurée et moderne (320px)
- ✅ **Saisie manuelle** des IDs si besoin (avec extraction depuis URL)
- ✅ **Configuration facile** des dates de début et fin
- ✅ **Mode debug** pour dépannage
- ✅ **Sauvegarde automatique** de votre configuration

## 📥 Installation

### Étape 1 : Installer Tampermonkey

Installez l'extension Tampermonkey pour votre navigateur :

- **Chrome/Edge** : [Tampermonkey sur Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox** : [Tampermonkey sur Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)
- **Safari** : [Tampermonkey sur App Store](https://apps.apple.com/app/tampermonkey/id1482490089)

### Étape 2 : Installer le script

1. Cliquez sur ce lien : [enedis-downloader-tampermonkey.user.js](./enedis-downloader-tampermonkey.user.js)
2. Cliquez sur le bouton **"Raw"** en haut à droite
3. Tampermonkey détectera automatiquement le script
4. Cliquez sur **"Installer"**

**OU** manuellement :

1. Cliquez sur l'icône Tampermonkey dans votre navigateur
2. Sélectionnez **"Créer un nouveau script"**
3. Supprimez le contenu par défaut
4. Copiez-collez le contenu de `enedis-downloader-tampermonkey.user.js`
5. Cliquez sur **Fichier → Enregistrer** (ou Ctrl+S)

## 🚀 Utilisation

### Méthode 1 : Détection automatique (recommandée)

1. Connectez-vous sur [mon-compte-particulier.enedis.fr](https://mon-compte-particulier.enedis.fr/)
2. Le panneau Enedis Downloader apparaît en haut à droite
3. Sur le site Enedis, cliquez sur **"Télécharger mes données"** (n'importe quelle période)
4. 🎉 Le script détecte automatiquement vos IDs !
5. Configurez vos dates si besoin (bouton **⚙️ Modifier les dates**)
6. Cliquez sur **📄 Télécharger**
7. Un seul fichier Excel est téléchargé avec toute votre période !

### Méthode 2 : Saisie manuelle

Si la détection automatique ne fonctionne pas :

1. Ouvrez les **DevTools** (F12) → Onglet **Network**
2. Sur Enedis, lancez un téléchargement manuel
3. Cherchez une requête contenant `donnees-energetiques` ou `file?`
4. Cliquez dessus et copiez l'URL complète
5. Dans le panneau, cliquez sur **✏️ Saisie manuelle**
6. Collez l'URL et cliquez sur **🔍 Extraire les IDs**

**Exemple d'URL à copier :**
```
https://alex.microapplications.enedis.fr/mes-mesures-prm/api/private/v2/personnes/ABC123XYZ/prms/01234567890123/donnees-energetiques/file?...
```

Les IDs seront automatiquement extraits :
- `personneId` : ABC123XYZ
- `prmId` : 01234567890123

## ⚙️ Configuration

### Paramètres par défaut

| Paramètre | Valeur par défaut | Description |
|-----------|-------------------|-------------|
| Date début | 01/05/2024 | Début de la période à télécharger |
| Date fin | 30/04/2025 | Fin de la période |

### Modifier la configuration

Cliquez sur **⚙️ Modifier les dates** pour ouvrir la modale de configuration :

- Ajustez les dates de début et fin
- L'aperçu vous indique la période qui sera téléchargée
- Un seul fichier Excel sera généré avec toute la période

## 🐛 Mode Debug

Si vous rencontrez des problèmes :

1. Cliquez sur **🐛 Debug** pour activer le mode debug
2. Ouvrez la console (F12)
3. Toutes les URLs interceptées seront affichées
4. Partagez les logs si vous avez besoin d'aide

## 📊 Après le téléchargement

Une fois les fichiers téléchargés :

1. Utilisez le script **[fusion.html](./fusion.html)** pour consolider tous les fichiers
2. Puis le **[comparateur](./comparateur/)** pour analyser vos consommations

## ❓ FAQ

### Le panneau n'apparaît pas ?

- Vérifiez que Tampermonkey est bien activé
- Actualisez la page (F5)
- Vérifiez que vous êtes sur un domaine Enedis supporté

### La détection automatique ne fonctionne pas ?

- Utilisez la saisie manuelle (bouton **✏️ Saisie manuelle**)
- Activez le mode debug pour voir les URLs interceptées
- Assurez-vous d'être connecté à votre compte Enedis

### Les téléchargements ne démarrent pas ?

- Vérifiez que les IDs sont bien détectés (en vert dans le panneau)
- Désactivez temporairement les bloqueurs de publicités
- Vérifiez la console pour les erreurs

### Puis-je télécharger plus d'un an de données ?

Oui ! Modifiez simplement les dates dans la configuration. Le script s'adapte automatiquement.

### Le fichier est trop volumineux ?

Si Enedis refuse de générer le fichier (période trop longue) :
1. Réduisez la période (par exemple : téléchargez 6 mois à la fois)
2. Faites plusieurs téléchargements successifs
3. Utilisez ensuite l'outil [fusion.html](./fusion.html) pour consolider

## 🔒 Sécurité et confidentialité

- ✅ Le script s'exécute **uniquement en local** dans votre navigateur
- ✅ Aucune donnée n'est envoyée à un serveur tiers
- ✅ Les IDs sont stockés localement avec `GM_setValue`
- ✅ Le code est open source et auditable

## 🛠️ Dépannage avancé

### Réinitialiser la configuration

Cliquez sur **🔄 Reset IDs** pour effacer les IDs sauvegardés et redémarrer la détection.

### Le script ne fonctionne que sur certains domaines

Le script est configuré pour :
- `https://alex.microapplications.enedis.fr/*`
- `https://mon-compte-particulier.enedis.fr/*`
- `https://apps.lincs.enedis.fr/*`

Si Enedis utilise un autre domaine, éditez le script et ajoutez la ligne `@match` correspondante.

## 📝 Notes importantes

- ⚠️ Pour les périodes très longues (>1 an), Enedis peut limiter la taille du fichier
- ⚠️ Dans ce cas, faites plusieurs téléchargements sur des périodes plus courtes
- ✅ Un seul fichier Excel est généré, pas besoin de fusion !

## 🤝 Contribution

Pour signaler un bug ou proposer une amélioration :
1. Ouvrez une issue sur GitHub
2. Ou soumettez une pull request

## 📄 Licence

Ce script est fourni tel quel, sans garantie. Utilisez-le à vos propres risques.

---

**Créé avec ❤️ pour faciliter l'exploitation de vos données Enedis**
