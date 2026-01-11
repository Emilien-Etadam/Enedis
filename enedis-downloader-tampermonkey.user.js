// ==UserScript==
// @name         Enedis - Téléchargement Auto Historique
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Téléchargement fichier unique sur toute la plage - Interface épurée
// @author       Next.ink / Emilien-Etadam
// @match        https://alex.microapplications.enedis.fr/*
// @match        https://mon-compte-particulier.enedis.fr/*
// @match        https://apps.lincs.enedis.fr/*
// @match        https://frontend-mes-mesures-prm-cloud.enedis.fr/*
// @match        https://*.enedis.fr/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ⚠️ NE S'EXÉCUTER QUE DANS LE FRAME PRINCIPAL, PAS DANS LES IFRAMES
    if (window.self !== window.top) {
        console.log('⚠️ [ENEDIS] Script dans un iframe, skip');
        return;
    }

    console.log('✅ [ENEDIS] Script dans le frame principal');

    // Configuration
    let CONFIG = {
        dateDebut: new Date(GM_getValue('dateDebut', '2024-05-01')),
        dateFin: new Date(GM_getValue('dateFin', '2025-04-30')),
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
            background: #2d3748;
            border-radius: 12px;
            padding: 16px;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            width: 320px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
        }

        #enedis-downloader h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
        }

        .enedis-section {
            background: rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 10px;
        }

        .enedis-section-title {
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 8px;
            opacity: 0.7;
            text-transform: uppercase;
        }

        .enedis-id-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 4px 0;
            font-size: 12px;
        }

        .enedis-id-label {
            opacity: 0.7;
        }

        .enedis-id-value {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            padding: 2px 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            font-size: 11px;
        }

        .enedis-id-detected {
            color: #4ade80;
        }

        .enedis-id-missing {
            color: #fbbf24;
        }

        .enedis-btn-group {
            display: flex;
            gap: 6px;
        }

        #enedis-downloader button {
            background: rgba(255,255,255,0.15);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
            flex: 1;
        }

        #enedis-downloader button:hover:not(:disabled) {
            background: rgba(255,255,255,0.25);
        }

        #enedis-downloader button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        #enedis-progress {
            margin-top: 10px;
            font-size: 11px;
            padding: 8px;
            background: rgba(0,0,0,0.2);
            border-radius: 6px;
            min-height: 20px;
        }

        .enedis-minimize {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255,255,255,0.1);
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .enedis-minimize:hover {
            background: rgba(255,255,255,0.2);
        }

        #enedis-downloader.minimized {
            padding: 12px;
            width: auto;
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

        .enedis-mode-toggle {
            display: flex;
            gap: 4px;
            margin-bottom: 8px;
        }

        .enedis-mode-btn {
            flex: 1;
            padding: 6px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            text-align: center;
        }

        .enedis-mode-btn.active {
            background: rgba(16, 185, 129, 0.3);
            border-color: #10b981;
        }

        .enedis-progress-bar {
            width: 100%;
            height: 18px;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }

        .enedis-progress-fill {
            height: 100%;
            background: #10b981;
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
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

            // Stocker les URLs des requêtes pour les lier aux Blobs
            window._enedisRequestUrls = [];

            // Intercepter XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            const originalSend = XMLHttpRequest.prototype.send;

            XMLHttpRequest.prototype.open = function(method, url) {
                this._enedisUrl = url;
                if (typeof url === 'string') {
                    // Logger uniquement les URLs Enedis
                    if (url.includes('enedis') || url.includes('personnes') || url.includes('prms')) {
                        console.log('🌐 [XHR OPEN]', url);
                    }
                    self.analyserURL(url, 'XMLHttpRequest');
                }
                return originalOpen.apply(this, arguments);
            };

            XMLHttpRequest.prototype.send = function() {
                if (this._enedisUrl) {
                    window._enedisRequestUrls.push(this._enedisUrl);
                    console.log('📤 [XHR SEND]', this._enedisUrl);
                }
                return originalSend.apply(this, arguments);
            };

            // Intercepter fetch
            const originalFetch = window.fetch;
            window.fetch = function(input, init) {
                const url = typeof input === 'string' ? input : (input.url || input);
                if (url && typeof url === 'string') {
                    window._enedisRequestUrls.push(url);
                    // Logger uniquement les URLs Enedis
                    if (url.includes('enedis') || url.includes('personnes') || url.includes('prms')) {
                        console.log('🌐 [FETCH]', url);
                    }
                    self.analyserURL(url, 'fetch');
                }
                return originalFetch.apply(this, arguments);
            };

            // Intercepter URL.createObjectURL pour tracer l'origine des Blobs
            const originalCreateObjectURL = URL.createObjectURL;
            URL.createObjectURL = function(blob) {
                const blobUrl = originalCreateObjectURL.apply(this, arguments);
                console.log('🎯 [BLOB CRÉÉ]', blobUrl);

                // Chercher la dernière requête qui pourrait être liée à ce blob
                if (window._enedisRequestUrls.length > 0) {
                    const lastUrl = window._enedisRequestUrls[window._enedisRequestUrls.length - 1];
                    console.log('   └─ Origine probable:', lastUrl);
                    self.analyserURL(lastUrl, 'Blob (requête origine)');
                }

                return blobUrl;
            };

            console.log('🔍 [ENEDIS] Interception réseau activée (XHR, fetch, Blob, DOM)');
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

                        <div class="enedis-form-info" style="background: #e0f2f1; border-color: #00897b;">
                            <div class="enedis-form-info-title" style="color: #00695c;">
                                📄 Mode fichier unique
                            </div>
                            <div class="enedis-form-info-text" style="color: #00695c;">
                                Un seul fichier Excel sera téléchargé avec toute la période sélectionnée.
                            </div>
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

            ['config-date-debut', 'config-date-fin', 'config-intervalle'].forEach(id => {
                document.getElementById(id).addEventListener('input', () => this.mettreAJourApercu());
            });

            this.mettreAJourApercu();
        }

        mettreAJourApercu() {
            try {
                const debut = new Date(document.getElementById('config-date-debut').value);
                const fin = new Date(document.getElementById('config-date-fin').value);

                if (debut >= fin) {
                    document.getElementById('config-preview').innerHTML =
                        '⚠️ La date de début doit être antérieure à la date de fin';
                    return;
                }

                const dureeJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
                const dureeMois = (dureeJours / 30).toFixed(1);

                document.getElementById('config-preview').innerHTML = `
                    <strong>1 fichier</strong> sera téléchargé<br>
                    Période : <strong>${dureeJours} jours</strong> (~${dureeMois} mois)<br>
                    Durée : <strong>Instantané</strong> ⚡
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

                if (debut >= fin) {
                    alert('❌ Date de début doit être < date de fin');
                    return;
                }

                CONFIG.dateDebut = debut;
                CONFIG.dateFin = fin;

                GM_setValue('dateDebut', formatDateInput(debut));
                GM_setValue('dateFin', formatDateInput(fin));

                this.downloadManager.mettreAJourStats();
                this.downloadManager.updateStatus('✅ Dates mises à jour !');

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



    function genererURL(debut, fin) {
        const base = 'https://alex.microapplications.enedis.fr/mes-mesures-prm/api/private/v2';
        return `${base}/personnes/${CONFIG.personneId}/prms/${CONFIG.prmId}/donnees-energetiques/file?mesuresTypeCode=COURBE&mesuresCorrigees=false&typeDonnees=CONS&dateDebut=${formatDate(debut)}&dateFin=${formatDate(fin)}&format=EXCEL&segments=C5`;
    }

    // Gestionnaire principal
    class DownloadManager {
        constructor() {
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
                    <div class="enedis-guide-title">💡 Comment détecter vos IDs ?</div>
                    <div class="enedis-guide-step">Sur Enedis, cliquez sur "Télécharger"</div>
                    <div class="enedis-guide-step">Puis cliquez sur "🔍 Détecter IDs"</div>
                    <div style="margin-top: 10px; font-size: 11px; opacity: 0.9;">
                        Si ça ne fonctionne pas, utilisez "✏️ Saisie manuelle"
                    </div>
                </div>
            ` : '';

            panel.innerHTML = `
                <button class="enedis-minimize" id="btn-minimize">−</button>
                <h3>⚡ Enedis Downloader</h3>
                <div class="enedis-content">
                    <div class="enedis-section">
                        <div class="enedis-section-title">Identifiants</div>
                        <div class="enedis-id-row">
                            <span class="enedis-id-label">Personne ID:</span>
                            <span class="enedis-id-value" id="status-personne">...</span>
                        </div>
                        <div class="enedis-id-row">
                            <span class="enedis-id-label">PRM ID:</span>
                            <span class="enedis-id-value" id="status-prm">...</span>
                        </div>
                        ${!idsDetectes ? `
                        <div class="enedis-btn-group" style="margin-top: 8px;">
                            <button id="btn-detect-ids">🔍 Détecter</button>
                            <button id="btn-manual-id">✏️ Manuel</button>
                        </div>
                        ` : ''}
                    </div>

                    <div class="enedis-section">
                        <div class="enedis-section-title">Période à télécharger</div>
                        <div class="enedis-id-row">
                            <span class="enedis-id-label">Du:</span>
                            <span id="periode-start">${formatDate(CONFIG.dateDebut).slice(5)}</span>
                        </div>
                        <div class="enedis-id-row">
                            <span class="enedis-id-label">Au:</span>
                            <span id="periode-end">${formatDate(CONFIG.dateFin).slice(5)}</span>
                        </div>
                        <button id="btn-config" style="width: 100%; margin-top: 8px;">⚙️ Modifier les dates</button>
                    </div>

                    <div class="enedis-btn-group">
                        <button id="btn-start" style="flex: 1;">📄 Télécharger</button>
                    </div>

                    <div class="enedis-btn-group" style="margin-top: 6px;">
                        <button id="btn-reset">🔄 Reset IDs</button>
                        <button id="btn-debug">${CONFIG.debugMode ? '🐛 Debug ON' : '🐛 Debug'}</button>
                    </div>

                    <div id="enedis-progress"></div>
                </div>
            `;

            document.body.appendChild(panel);

            document.getElementById('btn-start').addEventListener('click', () => this.demarrer());
                        document.getElementById('btn-config').addEventListener('click', () => this.configManager.ouvrir());
            document.getElementById('btn-reset').addEventListener('click', () => this.resetIDs());
            document.getElementById('btn-debug').addEventListener('click', () => this.toggleDebug());
            document.getElementById('btn-minimize').addEventListener('click', () => this.toggleMinimize());
                                    
            if (!idsDetectes) {
                document.getElementById('btn-manual-id').addEventListener('click', () => this.manualIDManager.ouvrir());
                document.getElementById('btn-detect-ids').addEventListener('click', () => this.forcerDetection());
            }

            this.mettreAJourInterface();
        }

        forcerDetection() {
            console.log('🔍 [ENEDIS] Forcer la détection des IDs...');
            this.updateStatus('🔍 Recherche des IDs en cours...');

            let idsDetectes = false;
            const pattern = /personnes\/(\d+)\/prms\/(\d+)/;

            // 1. Vérifier les requêtes stockées
            if (window._enedisRequestUrls && window._enedisRequestUrls.length > 0) {
                console.log(`📋 [ENEDIS] ${window._enedisRequestUrls.length} requête(s) interceptée(s)`);

                for (let i = window._enedisRequestUrls.length - 1; i >= 0; i--) {
                    const url = window._enedisRequestUrls[i];
                    const match = url.match(pattern);
                    if (match) {
                        const [, personneId, prmId] = match;
                        console.log('✅ [ENEDIS] Trouvé dans les requêtes:', personneId, prmId);

                        CONFIG.personneId = personneId;
                        CONFIG.prmId = prmId;
                        GM_setValue('personneId', personneId);
                        GM_setValue('prmId', prmId);

                        idsDetectes = true;
                        break;
                    }
                }
            } else {
                console.log('⚠️ [ENEDIS] Aucune requête interceptée');
            }

            // 2. Scanner les liens de la page
            if (!idsDetectes) {
                console.log('🔍 [ENEDIS] Scan des liens de la page...');
                const links = document.querySelectorAll('a[href*="personnes"], a[href*="donnees"]');
                console.log(`📋 [ENEDIS] ${links.length} lien(s) trouvé(s)`);

                links.forEach(link => {
                    if (!idsDetectes) {
                        const match = link.href.match(pattern);
                        if (match) {
                            const [, personneId, prmId] = match;
                            console.log('✅ [ENEDIS] Trouvé dans un lien:', personneId, prmId);

                            CONFIG.personneId = personneId;
                            CONFIG.prmId = prmId;
                            GM_setValue('personneId', personneId);
                            GM_setValue('prmId', prmId);

                            idsDetectes = true;
                        }
                    }
                });
            }

            // 3. Scanner le localStorage
            if (!idsDetectes) {
                console.log('🔍 [ENEDIS] Scan du localStorage...');
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        const value = localStorage.getItem(key);
                        if (value && typeof value === 'string') {
                            const match = value.match(pattern);
                            if (match) {
                                const [, personneId, prmId] = match;
                                console.log('✅ [ENEDIS] Trouvé dans localStorage:', personneId, prmId);

                                CONFIG.personneId = personneId;
                                CONFIG.prmId = prmId;
                                GM_setValue('personneId', personneId);
                                GM_setValue('prmId', prmId);

                                idsDetectes = true;
                                break;
                            }
                        }
                    }
                } catch (e) {
                    console.log('⚠️ [ENEDIS] Impossible d\'accéder au localStorage');
                }
            }

            // Résultat
            if (idsDetectes) {
                this.mettreAJourInterface();
                this.updateStatus('✅ IDs détectés avec succès !');

                if (typeof GM_notification !== 'undefined') {
                    GM_notification({
                        title: '✅ IDs Enedis détectés !',
                        text: `Personne: ${CONFIG.personneId}\nPRM: ${CONFIG.prmId}`,
                        timeout: 5000
                    });
                }

                // Recharger pour masquer le bouton
                setTimeout(() => location.reload(), 1000);
            } else {
                this.updateStatus('❌ Aucun ID détecté. Essayez la saisie manuelle.');
                console.log('❌ [ENEDIS] Aucun ID trouvé. Vérifiez :');
                console.log('   1. Avez-vous cliqué sur "Télécharger" sur Enedis ?');
                console.log('   2. La console affiche-t-elle des requêtes [FETCH] ou [XHR] ?');
                console.log('   3. Sinon, utilisez la saisie manuelle (bouton vert)');
            }
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

            if (CONFIG.personneId && CONFIG.prmId) {
                // Afficher Personne ID (tronqué si trop long)
                const personneText = CONFIG.personneId.length > 10 ?
                    CONFIG.personneId.substring(0, 10) + '...' :
                    CONFIG.personneId;
                statusPersonne.textContent = personneText;
                statusPersonne.className = 'enedis-id-value enedis-id-detected';
                statusPersonne.title = CONFIG.personneId;
                
                // Afficher PRM ID (tronqué si trop long)
                const prmText = CONFIG.prmId.length > 14 ?
                    CONFIG.prmId.substring(0, 14) :
                    CONFIG.prmId;
                if (statusPrm) {
                    statusPrm.textContent = prmText;
                    statusPrm.className = 'enedis-id-value enedis-id-detected';
                    statusPrm.title = CONFIG.prmId;
                }
            } else {
                statusPersonne.textContent = 'Non détecté';
                statusPersonne.className = 'enedis-id-value enedis-id-missing';
                statusPersonne.title = '';
                
                if (statusPrm) {
                    statusPrm.textContent = 'Non détecté';
                    statusPrm.className = 'enedis-id-value enedis-id-missing';
                    statusPrm.title = '';
                }
            }
        }

        mettreAJourStats() {
            const periodeStart = document.getElementById('periode-start');
            if (periodeStart) periodeStart.textContent = formatDate(CONFIG.dateDebut).slice(5);

            const periodeEnd = document.getElementById('periode-end');
            if (periodeEnd) periodeEnd.textContent = formatDate(CONFIG.dateFin).slice(5);
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

            // Mode unique uniquement
            await this.telechargerFichierUnique();
        }





        async telechargerFichierUnique() {
            if (!this.actif) return;

            const dateDebut = formatDate(CONFIG.dateDebut);
            const dateFin = formatDate(CONFIG.dateFin);
            
            console.log('📄 [ENEDIS] Téléchargement fichier unique');
            console.log(`📅 [ENEDIS] Période: ${dateDebut} → ${dateFin}`);

            const url = genererURL(CONFIG.dateDebut, CONFIG.dateFin);
            const fileName = `Enedis_${dateDebut}_${dateFin}.xlsx`;

            this.updateStatus(`📥 Téléchargement: ${dateDebut} → ${dateFin}`);

            console.log('📥 [ENEDIS] URL:', url);
            console.log('📥 [ENEDIS] Fichier:', fileName);

            try {
                // Créer un iframe caché pour déclencher le téléchargement
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = url;
                document.body.appendChild(iframe);

                // Nettoyer après un délai
                setTimeout(() => {
                    try {
                        document.body.removeChild(iframe);
                        console.log('✅ [ENEDIS] Téléchargement lancé avec succès');
                    } catch (e) {
                        // Ignorer si déjà supprimé
                    }
                }, 3000);

                this.updateStatus(`✅ Téléchargement lancé !<br><small>${fileName}</small>`);

                // Réactiver le bouton après 3 secondes
                setTimeout(() => {
                    document.getElementById('btn-start').disabled = false;
                }, 3000);

                // Notification
                if (typeof GM_notification !== 'undefined') {
                    GM_notification({
                        title: '✅ Téléchargement Enedis',
                        text: `Période: ${dateDebut} → ${dateFin}`,
                        timeout: 5000
                    });
                }
            } catch (error) {
                console.error('❌ [ENEDIS] Erreur:', error);
                this.updateStatus(`❌ Erreur: ${error.message}`);
                document.getElementById('btn-start').disabled = false;
            }
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
    console.log('⚡ [ENEDIS] Script v6.0 démarré - Mode fichier unique simplifié');
    new NetworkIDDetector();

    // ÉTAPE 2: Créer l'interface quand le DOM est prêt (UNE SEULE FOIS)
    if (!window._enedisDownloaderInitialized) {
        window._enedisDownloaderInitialized = true;

        window.addEventListener('load', () => {
            setTimeout(() => {
                // Vérifier qu'il n'y a pas déjà une interface
                if (document.getElementById('enedis-downloader')) {
                    console.log('⚠️ [ENEDIS] Interface déjà présente, skip');
                    return;
                }

                window.downloadManager = new DownloadManager();

                console.log('✅ [ENEDIS] Interface chargée');
                console.log('📅 [ENEDIS] Période:', formatDate(CONFIG.dateDebut), '→', formatDate(CONFIG.dateFin));

                if (CONFIG.personneId && CONFIG.prmId) {
                    console.log('✅ [ENEDIS] IDs déjà enregistrés:', CONFIG.personneId, CONFIG.prmId);
                } else {
                    console.log('⚠️ [ENEDIS] IDs manquants - Workflow:');
                    console.log('   1. Cliquez sur "Télécharger" sur Enedis');
                    console.log('   2. Attendez 1-2 secondes');
                    console.log('   3. Cliquez sur "🔍 Détecter IDs"');
                }
            }, 1500);
        });
    }
})();
