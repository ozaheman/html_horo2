/**
 * Jyotish Prediction Engine - Index Module
 * Handles prediction tab selection and display for the main index.html
 * 
 * Dependencies: 
 * - saravali_prediction.js (for Saravali engine)
 * - comprehensive_prediction_engine.js (for Comprehensive engine)
 */

(function() {
    'use strict';
    
    // Engine configurations
    const engineConfigs = {
        saravali: {
            name: 'Saravali Engine',
            description: 'Based on Saravali Jaimini predictive astrology',
            init: function() {
                // Initialize Saravali predictions
                return {
                    predictionCards: [
                        {
                            category: 'Karakas',
                            title: 'Atmakaraka: Sun in Leo',
                            description: 'Soul purpose through Atmakaraka',
                            shloka: 'Atmakaraka determines the soul\'s journey'
                        },
                        {
                            category: 'Karakas', 
                            title: 'Amatyakaraka: Jupiter in Sagittarius',
                            description: 'Career and professional success',
                            shloka: 'Amatyakaraka signifies stability'
                        },
                        {
                            category: 'Karakas',
                            title: 'Darakaraka: Venus in Libra',
                            description: 'Spouse and marriage indications',
                            shloka: 'Darakakaraka reveals marital dynamics'
                        }
                    ]
                };
            }
        },
        
        comprehensive: {
            name: 'Comprehensive Jyotish Engine',
            description: 'D1, D2, D3, D9 divisional charts · All 8 karakas · Yoga detection',
            init: function() {
                return {
                    predictionCards: [
                        {
                            category: '8 Karakas',
                            title: 'AK: Atmakaraka - Soul self',
                            description: 'Highest degree planet significator'
                        },
                        {
                            category: '8 Karakas',
                            title: 'AmK: Amatyakaraka - Career', 
                            description: '2nd highest degree planet'
                        },
                        {
                            category: '8 Karakas',
                            title: 'DK: Darakaraka - Spouse',
                            description: '8th highest degree planet'
                        }
                    ]
                };
            }
        },
        
        demo: {
            name: 'Chart Demo',
            description: 'Quick start with sample chart data',
            init: function() {
                return {
                    predictionCards: [
                        {
                            category: 'Sample Chart',
                            title: 'Lagna: Aries Rising',
                            description: 'Sun in Aries (25°), Moon in Cancer (28°)'
                        },
                        {
                            category: 'Key Placements',
                            title: 'Atmakaraka: Sun, Amatyakaraka: Jupiter',
                            description: 'Main karaka positions'
                        }
                    ]
                };
            }
        }
    };
    
    // Current engine state
    let currentEngine = 'saravali';
    
    // Load predictions for a specific engine
    function loadEngine(engineKey) {
        const config = engineConfigs[engineKey];
        if (!config) return;
        
        currentEngine = engineKey;
        
        // Update UI
        const titleEl = document.querySelector('.tab-header h1');
        const descEl = document.querySelector('.panel-subtitle');
        const panelEl = document.getElementById('saravali-panel');
        
        if (titleEl) titleEl.textContent = `${config.name} Predictions`;
        if (descEl) descEl.textContent = config.description;
        
        // Load prediction cards
        const cards = config.init().predictionCards;
        if (panelEl && cards.length > 0) {
            let html = '';
            cards.forEach(card => {
                html += `<div class="prediction-card">
                    <div class="card-category">${card.category}</div>
                    <div class="card-title">${card.title}</div>
                    <div class="card-description">${card.description}</div>
                    <div class="card-shloka">${card.shloka || ''}</div>
                </div>`;
            });
            panelEl.innerHTML = html;
        }
    }
    
    // Switch between engines
    function selectEngine(engineKey) {
        // Update active button state
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.engine === engineKey) {
                btn.classList.add('active');
            }
        });
        
        loadEngine(engineKey);
    }
    
    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        // Load default Saravali engine
        loadEngine('saravali');
        
        // Attach click handlers to control buttons
        document.querySelectorAll('.control-btn:not(.secondary)').forEach(btn => {
            btn.addEventListener('click', () => {
                const engineKey = btn.dataset.engine || 'saravali';
                selectEngine(engineKey);
            });
        });
    });
    
    // Expose for HTML onclick handlers
    window.selectEngine = selectEngine;
    window.loadEngine = loadEngine;
    
})();