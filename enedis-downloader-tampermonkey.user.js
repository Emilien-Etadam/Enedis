// ==UserScript==
// @name         Enedis - Téléchargement Auto Historique v5.2
// @namespace    http://tampermonkey.net/
// @version      5.2
// @description  Détection auto IDs (DOM + réseau) + Saisie manuelle + Debug complet
// @author       Next.ink / Emilien-Etadam
// @match        https://alex.microapplications.enedis.fr/*
// @match        https://mon-compte-particulier.enedis.fr/*
// @match        https://apps.lincs.enedis.fr/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        GM_setClipboard
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    let CONFIG = {
        dateDebut: new Date(GM_getValue('dateDebut', '2024-05-01')),
        dateFin: new Date(GM_getValue('dateFin', '2025-04-30')),
        intervalleJours: GM_getValue('intervalleJours', 7),
        chevauchement: GM_getValue('chevauchement', 1),
        delaiMs: GM_getValue('delaiMs', 2500),
        personneId: GM_getValue('personneId', null),
        prmId: GM_getValue('prmId', null),
        debugMode: GM_getValue('debugMode', false)
    };

    // CSS
    GM_addStyle(`
        #enedis-downloader {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 24px;
            z-index: 999999;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            min-width: 400px;
            max-width: 450px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        #enedis-downloader h3 {
            margin: 0 0 18px 0;
            font-size: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .enedis-section {
            background: rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 16px;
            backdrop-filter: blur(10px);
        }

        .enedis-section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            opacity: 0.95;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .enedis-id-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;
            font-size: 13px;
        }

        .enedis-id-label {
            opacity: 0.85;
            font-weight: 500;
        }

        .enedis-id-value {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            padding: 4px 10px;
            background: rgba(255,255,255,0.15);
            border-radius: 6px;
            font-size: 12px;
        }

        .enedis-id-detected {
            color: #4ade80;
            animation: pulse 2s ease-in-out infinite;
        }

        .enedis-id-missing {
            color: #fbbf24;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .enedis-guide {
            background: rgba(251, 191, 36, 0.2);
            border-left: 4px solid #fbbf24;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 16px;
        }

        .enedis-guide-title {
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .enedis-guide-step {
            margin: 6px 0;
            padding-left: 20px;
            position: relative;
        }

        .enedis-guide-step::before {
            content: "→";
            position: absolute;
            left: 4px;
            font-weight: 700;
        }

        .enedis-btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        #enedis-downloader button {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 700;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            flex: 1;
            min-width: 110px;
        }

        #enedis-downloader button:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        #enedis-downloader button:active:not(:disabled) {
            transform: translateY(-1px);
        }

        #enedis-downloader button:disabled {
            background: rgba(255,255,255,0.25);
            color: rgba(255,255,255,0.5);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        #enedis-progress {
            margin-top: 16px;
            font-size: 13px;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            min-height: 24px;
            font-weight: 500;
        }

        .enedis-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
        }

        .enedis-stat-item {
            background: rgba(255,255,255,0.08);
            padding: 10px;
            border-radius: 8px;
            text-align: center;
        }

        .enedis-stat-value {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .enedis-stat-label {
            font-size: 11px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .enedis-minimize {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255,255,255,0.2);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            color: white;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .enedis-minimize:hover {
            background: rgba(255,255,255,0.3);
            transform: rotate(180deg);
        }

        #enedis-downloader.minimized {
            padding: 16px;
            min-width: auto;
        }

        #enedis-downloader.minimized .enedis-content {
            display: none;
        }

        /* MODALE */
        .enedis-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(5px);
            z-index: 9999999;
            display: none;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        .enedis-modal.show {
            display: flex;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .enedis-modal-content {
            background: white;
            border-radius: 20px;
            padding: 32px;
            max-width: 550px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            animation: slideUp 0.3s ease;
            color: #333;
        }

        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .enedis-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
        }

        .enedis-modal-title {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .enedis-modal-close {
            background: #f3f4f6;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            color: #6b7280;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .enedis-modal-close:hover {
            background: #e5e7eb;
            color: #374151;
            transform: rotate(90deg);
        }

        .enedis-form-group {
            margin-bottom: 24px;
        }

        .enedis-form-label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
            font-size: 14px;
        }

        .enedis-form-description {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
            line-height: 1.5;
        }

        .enedis-form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            box-sizing: border-box;
            font-family: 'Courier New', monospace;
        }

        .enedis-form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .enedis-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .enedis-form-info {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
        }

        .enedis-form-info-title {
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 6px;
            font-size: 13px;
        }

        .enedis-form-info-text {
            font-size: 12px;
            color: #1e40af;
            line-height: 1.5;
        }

        .enedis-form-warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        }

        .enedis-form-warning-title {
            font-weight: 700;
            color: #92400e;
            margin-bottom: 6px;
            font-size: 13px;
        }

        .enedis-form-warning-text {
            font-size: 12px;
            color: #92400e;
            line-height: 1.5;
        }

        .enedis-modal-footer {
            display: flex;
            gap: 12px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
        }

        .enedis-modal-btn {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }

        .enedis-modal-btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .enedis-modal-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .enedis-modal-btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }

        .enedis-modal-btn-secondary:hover {
            background: #e5e7eb;
        }

        .enedis-debug-log {
            background: #1f2937;
            color: #10b981;
            padding: 12px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 12px;
            line-height: 1.6;
        }

        .enedis-copy-btn {
            background: #10b981 !important;
            color: white !important;
            padding: 8px 16px !important;
            font-size: 12px !important;
            margin-top: 8px;
        }
    `);

    // Détecteur amélioré avec logs
    class NetworkIDDetector {
        constructor() {
            this.detected = false;
            this.checkIntervalId = null;
            this.intercepterRequetes();
            this.surveillerDOM();
            this.analyserPageActuelle();
            console.log('🔍 [ENEDIS] Détecteur initialisé');
        }

        analyserPageActuelle() {
            // Analyser l'URL courante au cas où on serait déjà sur une page avec les IDs
            const currentUrl = window.location.href;
            this.analyserURL(currentUrl, 'URL courante');

            // Vérifier aussi dans le localStorage/sessionStorage d'Enedis
            try {
                const storage = window.localStorage;
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    const value = storage.getItem(key);
                    if (value && typeof value === 'string') {
                        this.analyserURL(value, 'localStorage');
                    }
                }
            } catch (e) {
                console.log('🔍 [ENEDIS] Impossible d\'accéder au localStorage');
            }
        }

        surveillerDOM() {
            const self = this;

            // Observer les mutations du DOM pour détecter les liens créés dynamiquement
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeName === 'A' && node.href) {
                            self.analyserURL(node.href, 'Lien ajouté');
                        } else if (node.nodeName === 'IFRAME' && node.src) {
                            self.analyserURL(node.src, 'iFrame ajouté');
                        }
                    });
                });
            });

            // Observer le body
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            } else {
                // Si le body n'existe pas encore, attendre
                setTimeout(() => this.surveillerDOM(), 100);
            }

            // Vérifier périodiquement tous les liens de la page
            this.checkIntervalId = setInterval(() => {
                document.querySelectorAll('a[href*="personnes"], a[href*="donnees-energetiques"]').forEach((link) => {
                    self.analyserURL(link.href, 'Lien existant');
                });
            }, 2000);
        }

        intercepterRequetes() {
            const self = this;

            // Intercepter XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                if (typeof url === 'string') {
                    // Logger uniquement les URLs Enedis
                    if (url.includes('enedis') || url.includes('personnes') || url.includes('prms')) {
                        console.log('🌐 [XHR]', url);
                    }
                    self.analyserURL(url, 'XMLHttpRequest');
                }
                return originalOpen.apply(this, arguments);
            };

            // Intercepter fetch
            const originalFetch = window.fetch;
            window.fetch = function(input) {
                const url = typeof input === 'string' ? input : (input.url || '');
                if (url) {
                    // Logger uniquement les URLs Enedis
                    if (url.includes('enedis') || url.includes('personnes') || url.includes('prms')) {
                        console.log('🌐 [FETCH]', url);
                    }
                    self.analyserURL(url, 'fetch');
                }
                return originalFetch.apply(this, arguments);
            };

            console.log('🔍 [ENEDIS] Interception réseau activée (XHR, fetch, DOM)');
            console.log('🔍 [ENEDIS] Mode debug:', CONFIG.debugMode ? 'ON' : 'OFF');
            console.log('💡 [ENEDIS] ASTUCE: Lancez un téléchargement sur Enedis');
        }

        analyserURL(url, source) {
            // Pattern principal basé sur l'URL réelle
            // Exemple: personnes/1136528033/prms/16238060718907/donnees-energetiques/file?
            const pattern = /personnes\/(\d+)\/prms\/(\d+)/;

            const match = url.match(pattern);
            if (match && !this.detected) {
                const [, personneId, prmId] = match;

                console.log(`🎯 [ENEDIS] IDs DÉTECTÉS depuis ${source} !`);
                console.log(`   └─ Personne ID: ${personneId}`);
                console.log(`   └─ PRM ID: ${prmId}`);
                console.log(`   └─ URL: ${url.substring(0, 100)}...`);

                this.detected = true; // Pour éviter de détecter plusieurs fois

                // Arrêter la surveillance périodique
                if (this.checkIntervalId) {
                    clearInterval(this.checkIntervalId);
                    this.checkIntervalId = null;
                }

                CONFIG.personneId = personneId;
                CONFIG.prmId = prmId;
                GM_setValue('personneId', personneId);
                GM_setValue('prmId', prmId);

                // Notification
                if (typeof GM_notification !== 'undefined') {
                    GM_notification({
                        title: '✅ IDs Enedis détectés !',
                        text: `Personne: ${personneId}\nPRM: ${prmId}`,
                        timeout: 5000
                    });
                }

                // Mettre à jour l'interface
                if (window.downloadManager) {
                    window.downloadManager.mettreAJourInterface();
                    window.downloadManager.updateStatus('✅ IDs détectés automatiquement !');
                }

                return true;
            }

            return false;
        }
    }

    // Gestionnaire de saisie manuelle
    class ManualIDManager {
        constructor(downloadManager) {
            this.downloadManager = downloadManager;
            this.creerModale();
        }

        creerModale() {
            const modal = document.createElement('div');
            modal.className = 'enedis-modal';
            modal.id = 'enedis-manual-id-modal';
            modal.innerHTML = `
                <div class="enedis-modal-content">
                    <div class="enedis-modal-header">
                        <div class="enedis-modal-title">🆔 Saisie manuelle des IDs</div>
                        <button class="enedis-modal-close" id="manual-close">×</button>
                    </div>

                    <div class="enedis-form-warning">
                        <div class="enedis-form-warning-title">💡 Comment trouver vos IDs ?</div>
                        <div class="enedis-form-warning-text">
                            1. Ouvrez DevTools (F12) → Onglet <strong>Network</strong><br>
                            2. Sur Enedis, cliquez sur <strong>"Télécharger"</strong><br>
                            3. Cherchez une requête <strong>"file?"</strong> ou <strong>"donnees"</strong><br>
                            4. Dans l'URL, récupérez les valeurs après <strong>personnes/</strong> et <strong>prms/</strong>
                        </div>
                    </div>

                    <div class="enedis-form-group">
                        <label class="enedis-form-label">🔗 URL complète (optionnel)</label>
                        <input type="text"
                               class="enedis-form-input"
                               id="manual-url"
                               placeholder="https://alex.microapplications.enedis.fr/.../personnes/ABC123/prms/XYZ456/...">
                        <div class="enedis-form-description">
                            Collez l'URL complète depuis Network Monitor, les IDs seront extraits automatiquement
                        </div>
                        <button class="enedis-modal-btn enedis-copy-btn" id="btn-extract-url">
                            🔍 Extraire les IDs de l'URL
                        </button>
                    </div>

                    <div style="text-align: center; margin: 20px 0; color: #9ca3af; font-weight: 700;">
                        OU
                    </div>

                    <div class="enedis-form-group">
                        <label class="enedis-form-label">👤 Personne ID</label>
                        <input type="text"
                               class="enedis-form-input"
                               id="manual-personne"
                               placeholder="Ex: KRT22PUD"
                               value="${CONFIG.personneId || ''}">
                        <div class="enedis-form-description">
                            Valeur après "personnes/" dans l'URL
                        </div>
                    </div>

                    <div class="enedis-form-group">
                        <label class="enedis-form-label">🏠 PRM ID</label>
                        <input type="text"
                               class="enedis-form-input"
                               id="manual-prm"
                               placeholder="Ex: 06205681943608"
                               value="${CONFIG.prmId || ''}">
                        <div class="enedis-form-description">
                            Valeur après "prms/" dans l'URL
                        </div>
                    </div>

                    <div class="enedis-modal-footer">
                        <button type="button" class="enedis-modal-btn enedis-modal-btn-secondary" id="manual-cancel">
                            Annuler
                        </button>
                        <button type="button" class="enedis-modal-btn enedis-modal-btn-primary" id="manual-save">
                            💾 Enregistrer
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            document.getElementById('manual-close').addEventListener('click', () => this.fermer());
            document.getElementById('manual-cancel').addEventListener('click', () => this.fermer());
            document.getElementById('manual-save').addEventListener('click', () => this.sauvegarder());
            document.getElementById('btn-extract-url').addEventListener('click', () => this.extraireURL());

            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.fermer();
            });
        }

        extraireURL() {
            const url = document.getElementById('manual-url').value.trim();

            if (!url) {
                alert('⚠️ Veuillez coller une URL');
                return;
            }

            const patterns = [
                /personnes\/([^\/]+)\/prms\/([^\/\?]+)/,
                /personnes%2F([^%\/]+)%2Fprms%2F([^%\/\?]+)/  // URL encodée
            ];

            for (let pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    const [, personneId, prmId] = match;
                    document.getElementById('manual-personne').value = decodeURIComponent(personneId);
                    document.getElementById('manual-prm').value = decodeURIComponent(prmId);
                    alert(`✅ IDs extraits !\n\nPersonne: ${personneId}\nPRM: ${prmId}`);
                    return;
                }
            }

            alert('❌ Impossible d\'extraire les IDs de cette URL.\n\nAssurez-vous qu\'elle contient "personnes/" et "prms/"');
        }

        ouvrir() {
            document.getElementById('manual-personne').value = CONFIG.personneId || '';
            document.getElementById('manual-prm').value = CONFIG.prmId || '';
            document.getElementById('manual-url').value = '';
            document.getElementById('enedis-manual-id-modal').classList.add('show');
        }

        fermer() {
            document.getElementById('enedis-manual-id-modal').classList.remove('show');
        }

        sauvegarder() {
            const personneId = document.getElementById('manual-personne').value.trim();
            const prmId = document.getElementById('manual-prm').value.trim();

            if (!personneId || !prmId) {
                alert('⚠️ Veuillez remplir les deux champs');
                return;
            }

            CONFIG.personneId = personneId;
            CONFIG.prmId = prmId;
            GM_setValue('personneId', personneId);
            GM_setValue('prmId', prmId);

            this.downloadManager.mettreAJourInterface();
            this.downloadManager.updateStatus('✅ IDs enregistrés manuellement !');

            console.log('✅ [ENEDIS] IDs enregistrés:', personneId, prmId);

            this.fermer();
        }
    }

    // Gestionnaire de configuration (dates)
    class ConfigManager {
        constructor(downloadManager) {
            this.downloadManager = downloadManager;
            this.creerModale();
        }

        creerModale() {
            const modal = document.createElement('div');
            modal.className = 'enedis-modal';
            modal.id = 'enedis-config-modal';
            modal.innerHTML = `
                <div class="enedis-modal-content">
                    <div class="enedis-modal-header">
                        <div class="enedis-modal-title">⚙ Configuration</div>
                        <button class="enedis-modal-close" id="config-close">×</button>
                    </div>

                    <div class="enedis-form-info">
                        <div class="enedis-form-info-title">💡 Astuce</div>
                        <div class="enedis-form-info-text">
                            Modifiez les dates et paramètres ci-dessous.
                            Le nombre de fichiers sera recalculé automatiquement.
                        </div>
                    </div>

                    <form id="enedis-config-form">
                        <div class="enedis-form-group">
                            <label class="enedis-form-label">📅 Date de début</label>
                            <input type="date"
                                   class="enedis-form-input"
                                   id="config-date-debut"
                                   value="${formatDateInput(CONFIG.dateDebut)}"
                                   required>
                        </div>

                        <div class="enedis-form-group">
                            <label class="enedis-form-label">📅 Date de fin</label>
                            <input type="date"
                                   class="enedis-form-input"
                                   id="config-date-fin"
                                   value="${formatDateInput(CONFIG.dateFin)}"
                                   required>
                        </div>

                        <div class="enedis-form-row">
                            <div class="enedis-form-group">
                                <label class="enedis-form-label">📊 Intervalle (jours)</label>
                                <input type="number"
                                       class="enedis-form-input"
                                       id="config-intervalle"
                                       value="${CONFIG.intervalleJours}"
                                       min="1"
                                       max="365">
                            </div>

                            <div class="enedis-form-group">
                                <label class="enedis-form-label">🔄 Chevauchement</label>
                                <input type="number"
                                       class="enedis-form-input"
                                       id="config-chevauchement"
                                       value="${CONFIG.chevauchement}"
                                       min="0"
                                       max="7">
                            </div>
                        </div>

                        <div class="enedis-form-group">
                            <label class="enedis-form-label">⏱ Délai (ms)</label>
                            <input type="number"
                                   class="enedis-form-input"
                                   id="config-delai"
                                   value="${CONFIG.delaiMs}"
                                   min="1000"
                                   max="10000"
                                   step="500">
                        </div>

                        <div class="enedis-form-info" style="background: #f0fdf4; border-color: #22c55e;">
                            <div class="enedis-form-info-title" style="color: #15803d;">
                                📦 Aperçu
                            </div>
                            <div class="enedis-form-info-text" id="config-preview" style="color: #15803d;">
                                Calcul en cours...
                            </div>
                        </div>
                    </form>

                    <div class="enedis-modal-footer">
                        <button type="button" class="enedis-modal-btn enedis-modal-btn-secondary" id="config-cancel">
                            Annuler
                        </button>
                        <button type="button" class="enedis-modal-btn enedis-modal-btn-primary" id="config-save">
                            💾 Enregistrer
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('config-close').addEventListener('click', () => this.fermer());
            document.getElementById('config-cancel').addEventListener('click', () => this.fermer());
            document.getElementById('config-save').addEventListener('click', () => this.sauvegarder());

            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.fermer();
            });

            ['config-date-debut', 'config-date-fin', 'config-intervalle', 'config-chevauchement'].forEach(id => {
                document.getElementById(id).addEventListener('input', () => this.mettreAJourApercu());
            });

            this.mettreAJourApercu();
        }

        mettreAJourApercu() {
            try {
                const debut = new Date(document.getElementById('config-date-debut').value);
                const fin = new Date(document.getElementById('config-date-fin').value);
                const intervalle = parseInt(document.getElementById('config-intervalle').value);
                const chevauchement = parseInt(document.getElementById('config-chevauchement').value);

                if (debut >= fin) {
                    document.getElementById('config-preview').innerHTML =
                        '⚠️ La date de début doit être antérieure à la date de fin';
                    return;
                }

                let count = 0;
                let dateActuelle = new Date(debut);
                while (dateActuelle < fin && count < 1000) {
                    count++;
                    dateActuelle.setDate(dateActuelle.getDate() + intervalle - chevauchement);
                }

                const dureeJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
                const dureeMinutes = Math.ceil((count * parseInt(document.getElementById('config-delai').value)) / 60000);

                document.getElementById('config-preview').innerHTML = `
                    <strong>${count} fichiers</strong> seront téléchargés<br>
                    Période : <strong>${dureeJours} jours</strong><br>
                    Durée estimée : <strong>~${dureeMinutes} min</strong>
                `;
            } catch (e) {
                document.getElementById('config-preview').innerHTML = '⚠️ Vérifiez vos paramètres';
            }
        }

        ouvrir() {
            document.getElementById('config-date-debut').value = formatDateInput(CONFIG.dateDebut);
            document.getElementById('config-date-fin').value = formatDateInput(CONFIG.dateFin);
            document.getElementById('config-intervalle').value = CONFIG.intervalleJours;
            document.getElementById('config-chevauchement').value = CONFIG.chevauchement;
            document.getElementById('config-delai').value = CONFIG.delaiMs;

            this.mettreAJourApercu();
            document.getElementById('enedis-config-modal').classList.add('show');
        }

        fermer() {
            document.getElementById('enedis-config-modal').classList.remove('show');
        }

        sauvegarder() {
            try {
                const debut = new Date(document.getElementById('config-date-debut').value);
                const fin = new Date(document.getElementById('config-date-fin').value);
                const intervalle = parseInt(document.getElementById('config-intervalle').value);
                const chevauchement = parseInt(document.getElementById('config-chevauchement').value);
                const delai = parseInt(document.getElementById('config-delai').value);

                if (debut >= fin) {
                    alert('❌ Date de début doit être < date de fin');
                    return;
                }

                CONFIG.dateDebut = debut;
                CONFIG.dateFin = fin;
                CONFIG.intervalleJours = intervalle;
                CONFIG.chevauchement = chevauchement;
                CONFIG.delaiMs = delai;

                GM_setValue('dateDebut', formatDateInput(debut));
                GM_setValue('dateFin', formatDateInput(fin));
                GM_setValue('intervalleJours', intervalle);
                GM_setValue('chevauchement', chevauchement);
                GM_setValue('delaiMs', delai);

                this.downloadManager.periodes = genererPeriodes();
                this.downloadManager.index = 0;
                this.downloadManager.mettreAJourStats();
                this.downloadManager.updateStatus('✅ Configuration mise à jour !');

                this.fermer();
            } catch (e) {
                alert('❌ Erreur : ' + e.message);
            }
        }
    }

    // Fonctions utilitaires
    function formatDate(date) {
        const j = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const a = date.getFullYear();
        return `${a}-${m}-${j}`;
    }

    function formatDateInput(date) {
        return formatDate(date);
    }

    function genererPeriodes() {
        const periodes = [];
        let dateActuelle = new Date(CONFIG.dateDebut);

        while (dateActuelle < CONFIG.dateFin) {
            const finPeriode = new Date(dateActuelle);
            finPeriode.setDate(finPeriode.getDate() + CONFIG.intervalleJours - 1);

            if (finPeriode > CONFIG.dateFin) {
                finPeriode.setTime(CONFIG.dateFin.getTime());
            }

            periodes.push({
                debut: new Date(dateActuelle),
                fin: new Date(finPeriode)
            });

            dateActuelle.setDate(dateActuelle.getDate() + CONFIG.intervalleJours - CONFIG.chevauchement);
        }

        return periodes;
    }

    function genererURL(debut, fin) {
        const base = 'https://alex.microapplications.enedis.fr/mes-mesures-prm/api/private/v2';
        return `${base}/personnes/${CONFIG.personneId}/prms/${CONFIG.prmId}/donnees-energetiques/file?mesuresTypeCode=COURBE&mesuresCorrigees=false&typeDonnees=CONS&dateDebut=${formatDate(debut)}&dateFin=${formatDate(fin)}&format=EXCEL&segments=C5`;
    }

    // Gestionnaire principal
    class DownloadManager {
        constructor() {
            this.periodes = genererPeriodes();
            this.index = 0;
            this.actif = false;
            this.minimized = false;
            this.creerInterface();
            this.configManager = new ConfigManager(this);
            this.manualIDManager = new ManualIDManager(this);
        }

        creerInterface() {
            const panel = document.createElement('div');
            panel.id = 'enedis-downloader';

            const idsDetectes = CONFIG.personneId && CONFIG.prmId;
            const guideHTML = !idsDetectes ? `
                <div class="enedis-guide">
                    <div class="enedis-guide-title">💡 Détection automatique</div>
                    <div class="enedis-guide-step">Ouvrez DevTools (F12) → Network</div>
                    <div class="enedis-guide-step">Cliquez sur "Télécharger" sur Enedis</div>
                    <div class="enedis-guide-step">Les IDs seront détectés auto</div>
                    <div style="margin-top: 10px; text-align: center;">
                        <strong>OU</strong> cliquez sur "✏️ Saisie manuelle"
                    </div>
                </div>
            ` : '';

            panel.innerHTML = `
                <button class="enedis-minimize" id="btn-minimize">−</button>
                <h3>⚡ Enedis Downloader</h3>
                <div class="enedis-content">
                    ${guideHTML}

                    <div class="enedis-section">
                        <div class="enedis-section-title">🆔 Identifiants</div>
                        <div class="enedis-id-row">
                            <span class="enedis-id-label">Personne:</span>
                            <span class="enedis-id-value" id="status-personne">...</span>
                        </div>
                        <div class="enedis-id-row">
                            <span class="enedis-id-label">PRM:</span>
                            <span class="enedis-id-value" id="status-prm">...</span>
                        </div>
                        ${!idsDetectes ? `
                        <button id="btn-manual-id" style="width: 100%; margin-top: 12px; background: #10b981 !important; color: white !important;">
                            ✏️ Saisie manuelle
                        </button>
                        ` : ''}
                    </div>

                    <div class="enedis-section">
                        <div class="enedis-section-title">📊 Configuration</div>
                        <div class="enedis-stats">
                            <div class="enedis-stat-item">
                                <div class="enedis-stat-value" id="stat-fichiers">${this.periodes.length}</div>
                                <div class="enedis-stat-label">Fichiers</div>
                            </div>
                            <div class="enedis-stat-item">
                                <div class="enedis-stat-value">${CONFIG.intervalleJours}j</div>
                                <div class="enedis-stat-label">Intervalle</div>
                            </div>
                        </div>
                        <div class="enedis-id-row" style="margin-top: 10px;">
                            <span class="enedis-id-label">Période:</span>
                            <span style="font-size: 11px;" id="periode-display">${formatDate(CONFIG.dateDebut)} → ${formatDate(CONFIG.dateFin)}</span>
                        </div>
                    </div>

                    <div class="enedis-btn-group">
                        <button id="btn-start">▶ Démarrer</button>
                        <button id="btn-pause" disabled>⏸ Pause</button>
                    </div>

                    <div class="enedis-btn-group" style="margin-top: 10px;">
                        <button id="btn-config">⚙ Dates</button>
                        <button id="btn-reset">🔄 Reset</button>
                        <button id="btn-debug">${CONFIG.debugMode ? '🐛 Debug ON' : '🐛 Debug'}</button>
                    </div>

                    <div id="enedis-progress"></div>
                </div>
            `;

            document.body.appendChild(panel);

            document.getElementById('btn-start').addEventListener('click', () => this.demarrer());
            document.getElementById('btn-pause').addEventListener('click', () => this.pause());
            document.getElementById('btn-config').addEventListener('click', () => this.configManager.ouvrir());
            document.getElementById('btn-reset').addEventListener('click', () => this.resetIDs());
            document.getElementById('btn-minimize').addEventListener('click', () => this.toggleMinimize());
            document.getElementById('btn-debug').addEventListener('click', () => this.toggleDebug());

            if (!idsDetectes) {
                document.getElementById('btn-manual-id').addEventListener('click', () => this.manualIDManager.ouvrir());
            }

            this.mettreAJourInterface();
        }

        toggleDebug() {
            CONFIG.debugMode = !CONFIG.debugMode;
            GM_setValue('debugMode', CONFIG.debugMode);
            document.getElementById('btn-debug').textContent = CONFIG.debugMode ? '🐛 Debug ON' : '🐛 Debug';
            console.log('🐛 [ENEDIS] Mode debug:', CONFIG.debugMode ? 'ACTIVÉ' : 'DÉSACTIVÉ');
            alert(CONFIG.debugMode ?
                '🐛 Mode debug ACTIVÉ\n\nToutes les URLs Enedis seront affichées dans la console (F12)' :
                '🐛 Mode debug DÉSACTIVÉ');
        }

        toggleMinimize() {
            this.minimized = !this.minimized;
            document.getElementById('enedis-downloader').classList.toggle('minimized', this.minimized);
            document.getElementById('btn-minimize').textContent = this.minimized ? '+' : '−';
        }

        mettreAJourInterface() {
            const statusPersonne = document.getElementById('status-personne');
            const statusPrm = document.getElementById('status-prm');

            if (CONFIG.personneId) {
                statusPersonne.textContent = CONFIG.personneId;
                statusPersonne.className = 'enedis-id-value enedis-id-detected';
            } else {
                statusPersonne.textContent = 'En attente...';
                statusPersonne.className = 'enedis-id-value enedis-id-missing';
            }

            if (CONFIG.prmId) {
                statusPrm.textContent = CONFIG.prmId;
                statusPrm.className = 'enedis-id-value enedis-id-detected';
            } else {
                statusPrm.textContent = 'En attente...';
                statusPrm.className = 'enedis-id-value enedis-id-missing';
            }

            if (CONFIG.personneId && CONFIG.prmId) {
                const guide = document.querySelector('.enedis-guide');
                if (guide) guide.style.display = 'none';

                // Masquer le bouton de saisie manuelle s'il existe
                const btnManual = document.getElementById('btn-manual-id');
                if (btnManual) btnManual.style.display = 'none';
            }
        }

        mettreAJourStats() {
            document.getElementById('stat-fichiers').textContent = this.periodes.length;
            document.getElementById('periode-display').textContent =
                `${formatDate(CONFIG.dateDebut)} → ${formatDate(CONFIG.dateFin)}`;
        }

        updateStatus(message) {
            document.getElementById('enedis-progress').innerHTML = message;
        }

        async demarrer() {
            if (!CONFIG.personneId || !CONFIG.prmId) {
                this.updateStatus('⚠️ IDs manquants ! Cliquez sur "✏️ Saisie manuelle"');
                return;
            }

            this.actif = true;
            document.getElementById('btn-start').disabled = true;
            document.getElementById('btn-pause').disabled = false;

            await this.telechargerSuivant();
        }

        pause() {
            this.actif = false;
            document.getElementById('btn-start').disabled = false;
            document.getElementById('btn-pause').disabled = true;
            this.updateStatus('⏸ En pause');
        }

        async telechargerSuivant() {
            if (!this.actif || this.index >= this.periodes.length) {
                if (this.index >= this.periodes.length) {
                    this.updateStatus('✅ Terminé ! Tous les fichiers ont été téléchargés.');
                    document.getElementById('btn-start').disabled = true;
                    document.getElementById('btn-pause').disabled = true;
                }
                return;
            }

            const periode = this.periodes[this.index];
            const url = genererURL(periode.debut, periode.fin);

            const progression = `${this.index + 1}/${this.periodes.length}`;
            const pourcentage = Math.round((this.index / this.periodes.length) * 100);
            this.updateStatus(`📥 ${progression} (${pourcentage}%) : ${formatDate(periode.debut)} → ${formatDate(periode.fin)}`);

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);

            this.index++;
            setTimeout(() => this.telechargerSuivant(), CONFIG.delaiMs);
        }

        resetIDs() {
            if (confirm('🔄 Réinitialiser les IDs ?')) {
                CONFIG.personneId = null;
                CONFIG.prmId = null;
                GM_setValue('personneId', null);
                GM_setValue('prmId', null);
                location.reload();
            }
        }
    }

    // Initialisation en 2 étapes

    // ÉTAPE 1: Intercepter le réseau immédiatement (document-start)
    console.log('⚡ [ENEDIS] Script v5.2 démarré - Détection DOM + réseau');
    new NetworkIDDetector();

    // ÉTAPE 2: Créer l'interface quand le DOM est prêt
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.downloadManager = new DownloadManager();

            console.log('✅ [ENEDIS] Interface chargée');
            console.log('📅 [ENEDIS] Période:', formatDate(CONFIG.dateDebut), '→', formatDate(CONFIG.dateFin));

            if (CONFIG.personneId && CONFIG.prmId) {
                console.log('✅ [ENEDIS] IDs déjà enregistrés:', CONFIG.personneId, CONFIG.prmId);
            } else {
                console.log('⚠️ [ENEDIS] IDs manquants - Lancez un téléchargement sur Enedis pour les détecter');
            }
        }, 1500);
    });
})();
