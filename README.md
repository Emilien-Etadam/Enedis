# Récupérez et exploitez vos données Enedis avec Next !

## 🔌 Script Tampermonkey (recommandé)

**Nouveau !** Script automatique avec interface graphique pour télécharger facilement vos données sur plusieurs mois.

👉 **[Installation et guide complet](./README-TAMPERMONKEY.md)**

**Fonctionnalités :**
- ✅ Détection automatique des identifiants
- ✅ Interface graphique moderne
- ✅ Configuration facile des dates
- ✅ Téléchargement par lots automatique

## 📜 Script navigateur (console)

Le [script_navigateur](./Script_navigateur) permet de récupérer des mois de données de consommation horaire via la console du navigateur. « personneId » et « prmId » sont des variables qui dépendent de votre compteur, à récupérer depuis la console de votre navigateur une fois connecté à Enedis. [Toutes les explications se trouvent sur Next.ink](https://next.ink/184867/linky-enedis-limite-le-telechargement-de-vos-donnees-next-vous-propose-une-solution/), ainsi que la manière de récupérer les variables.

## 📊 Fusion et analyse

Passez ensuite les fichiers dans le script [fusion.html](./fusion.html) pour n'en former plus qu'un seul. Cet outil regroupe automatiquement tous les fichiers téléchargés et vérifie la cohérence des données.

Utilisez ensuite notre [comparateur](./comparateur/) en local, dans votre navigateur. Vous pouvez ajuster les plages horaires, les tarifs du kWh et des abonnements, les tarifs Tempo… L'outil vous donne au final un comparatif de plusieurs offres, le tout en local dans votre navigateur.

![image](https://github.com/user-attachments/assets/6b08330c-fa8f-4054-9729-ab50a2be4fb5)

---

*L'IA Claude a contribué à la réalisation de ces scripts.*
