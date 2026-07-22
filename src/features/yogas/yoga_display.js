/**
 * Yoga Display UI Component
 * Renders yoga calculations as dashboard tiles with detailed analysis and remedies
 */

/**
 * Initialize yoga display dashboard
 */
function initializeYogaDashboard() {
    // Check if yogas container exists, if not create it
    let yogasContainer = document.getElementById('yogas-dashboard');
    if (!yogasContainer) {
        yogasContainer = document.createElement('div');
        yogasContainer.id = 'yogas-dashboard';
        yogasContainer.className = 'yogas-dashboard-container';
        
        // Insert after main chart area
        const mainContainer = document.querySelector('.main-container') || document.body;
        mainContainer.appendChild(yogasContainer);
    }
    
    // Add CSS if not already present
    if (!document.getElementById('yoga-dashboard-styles')) {
        addYogaDashboardStyles();
    }
}

/**
 * Add CSS styles for yoga dashboard
 */
function addYogaDashboardStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'yoga-dashboard-styles';
    styleElement.textContent = `
        .yogas-dashboard-container {
            margin-top: 30px;
            padding: 20px;
            border-top: 3px solid #8B4513;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        }
        
        .yoga-dashboard-title {
            font-size: 24px;
            font-weight: bold;
            color: #4a3728;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .yoga-summary-section {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #D4AF37;
        }
        
        .yoga-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .summary-stat {
            text-align: center;
            padding: 10px;
            border-radius: 5px;
        }
        
        .summary-stat.positive {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .summary-stat.negative {
            background: #ffebee;
            color: #c62828;
        }
        
        .summary-stat.special {
            background: #fff3e0;
            color: #e65100;
        }
        
        .summary-stat-number {
            font-size: 28px;
            font-weight: bold;
            color: inherit;
        }
        
        .summary-stat-label {
            font-size: 12px;
            color: inherit;
            opacity: 0.8;
        }
        
        .yoga-index-indicator {
            background: linear-gradient(90deg, #d32f2f 0%, #ff9800 25%, #fbc02d 50%, #8bc34a 75%, #4caf50 100%);
            height: 8px;
            border-radius: 10px;
            margin: 10px 0;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .yoga-tile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .yoga-tile {
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            border-top: 4px solid #666;
            cursor: pointer;
        }
        
        .yoga-tile:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.2);
        }
        
        .yoga-tile.positive {
            border-top-color: #4caf50;
            background: linear-gradient(135deg, #f1f8f6 0%, #e8f5e9 100%);
        }
        
        .yoga-tile.negative {
            border-top-color: #f44336;
            background: linear-gradient(135deg, #fef5f5 0%, #ffebee 100%);
        }
        
        .yoga-tile.special {
            border-top-color: #ff9800;
            background: linear-gradient(135deg, #fef5f0 0%, #fff3e0 100%);
        }
        
        .yoga-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }
        
        .yoga-strength-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .strength-very-strong {
            background: #2e7d32;
            color: white;
        }
        
        .strength-strong {
            background: #558b2f;
            color: white;
        }
        
        .strength-moderate {
            background: #f57f17;
            color: white;
        }
        
        .strength-weak {
            background: #c62828;
            color: white;
        }
        
        .yoga-effect {
            font-size: 13px;
            color: #555;
            line-height: 1.4;
            margin-bottom: 10px;
        }
        
        .yoga-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .keyword-tag {
            background: rgba(0,0,0,0.1);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            color: #666;
        }
        
        .yoga-remedies-btn {
            display: inline-block;
            padding: 6px 12px;
            background: #D4AF37;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            transition: background 0.3s ease;
            margin-top: 8px;
        }
        
        .yoga-remedies-btn:hover {
            background: #c19e20;
        }
        
        /* Modal Styles */
        .yoga-modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .yoga-modal-overlay.active {
            display: flex;
        }
        
        .yoga-modal-content {
            background: white;
            border-radius: 10px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .yoga-modal-header {
            background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .yoga-modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }
        
        .yoga-modal-body {
            padding: 20px;
        }
        
        .remedy-section {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #D4AF37;
            border-radius: 5px;
        }
        
        .remedy-section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .remedy-section-title::before {
            content: '★';
            color: #D4AF37;
            font-size: 18px;
            margin-right: 8px;
        }
        
        .remedy-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .remedy-item {
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
            color: #555;
        }
        
        .remedy-item:last-child {
            border-bottom: none;
        }
        
        .remedy-item::before {
            content: '✓';
            color: #4caf50;
            font-weight: bold;
            margin-right: 8px;
        }
        
        .mantra-highlight {
            background: #fff9c4;
            padding: 10px;
            border-radius: 5px;
            font-style: italic;
            color: #333;
            margin: 10px 0;
            border-left: 3px solid #fbc02d;
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .tab {
            padding: 10px 15px;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-weight: bold;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
        }
        
        .tab.active {
            color: #D4AF37;
            border-bottom-color: #D4AF37;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .filter-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 15px;
            border: 2px solid #D4AF37;
            background: white;
            color: #D4AF37;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            font-size: 12px;
        }
        
        .filter-btn:hover,
        .filter-btn.active {
            background: #D4AF37;
            color: white;
        }
        
        @media (max-width: 768px) {
            .yoga-tile-grid {
                grid-template-columns: 1fr;
            }
            
            .yoga-summary-grid {
                grid-template-columns: 1fr;
            }
            
            .yoga-modal-content {
                width: 95%;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * Render all detected yogas to the dashboard
 * @param {Array} detectedYogasAnalysis - Array of yoga analyses
 * @param {Object} summary - Summary stats of all yogas
 */
function renderYogasDashboard(yogasData = [], summary = {}) {
    initializeYogaDashboard();
    
    const container = document.getElementById('yogas-dashboard');
    if (!container) return;
    
    let html = '<div class="yoga-dashboard-title">🌟 VEDIC YOGA ANALYSIS 🌟</div>';
    
    // Calculate statistics from all yogas
    const detectedYogas = Array.isArray(yogasData) ? yogasData.filter(y => y.detected) : [];
    const positiveDetected = detectedYogas.filter(y => y.quality === 'Positive').length;
    const negativeDetected = detectedYogas.filter(y => y.quality === 'Negative').length;
    const specialDetected = detectedYogas.filter(y => y.quality === 'Special' || y.quality === 'Special - Fall and Rise').length;
    const totalDetected = detectedYogas.length;
    
    // Calculate overallIndex for the summary
    let positiveScore = 0, negativeScore = 0;
    detectedYogas.forEach(y => {
        const score = typeof y.strength === 'object' ? (y.strength.score || 10) : 10;
        if (y.quality === 'Positive') positiveScore += score;
        else if (y.quality === 'Negative') negativeScore += score;
    });
    const netScore = positiveScore - negativeScore;
    let interpretation = 'Neutral';
    if (netScore > 30) interpretation = 'Strongly Positive';
    else if (netScore > 10) interpretation = 'Positive';
    else if (netScore < -30) interpretation = 'Highly Challenging';
    else if (netScore < -10) interpretation = 'Challenging';
    
    const calculatedSummary = {
        positive: { length: positiveDetected },
        negative: { length: negativeDetected },
        special: { length: specialDetected },
        totalYogasDetected: totalDetected,
        primaryYogas: detectedYogas.slice(0, 8),
        overallIndex: {
            score: netScore,
            positiveScore: positiveScore,
            negativeScore: negativeScore,
            interpretation: interpretation
        }
    };
    
    // Render summary section
    if (detectedYogas.length > 0) {
        html += renderSummarySection(calculatedSummary);
    }
    
    // Render filter buttons
    html += renderFilterButtons();
    
    // Add info about reference yogas
    const totalAvailable = Array.isArray(yogasData) ? yogasData.length : 0;
    const referenceCount = totalAvailable - detectedYogas.length;
    if (referenceCount > 0) {
        html += `<div style="text-align: center; padding: 10px; color: #999; font-size: 12px; margin-bottom: 15px;">
                    Showing ${detectedYogas.length} detected yogas • ${referenceCount} reference yogas available (enable 📚 checkbox)
                </div>`;
    }
    
    // Render yoga tiles - Show only DETECTED yogas by default, hide reference yogas
    html += '<div class="yoga-tile-grid" id="yoga-tiles-grid">';
    
    if (Array.isArray(yogasData)) {
        yogasData.forEach(yoga => {
            // Pass true to hide reference yogas by default
            const yToRender = typeof yoga.strength === 'object' ? yoga : { ...yoga, strength: { level: yoga.strength || 'Moderate', score: 10 } };
            html += renderYogaTile(yToRender, true);
        });
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Attach event listeners
    attachYogaTileListeners();
    attachFilterListeners();
}

/**
 * Render summary statistics section
 * @param {Object} summary - Summary data object
 * @returns {String} HTML for summary section
 */
function renderSummarySection(summary = {}) {
    const positive = summary.positive?.length || 0;
    const negative = summary.negative?.length || 0;
    const special = summary.special?.length || 0;
    const total = summary.totalYogasDetected || 0;
    const index = summary.overallIndex || {};
    
    let html = `
        <div class="yoga-summary-section">
            <div class="yoga-summary-grid">
                <div class="summary-stat positive">
                    <div class="summary-stat-number">${positive}</div>
                    <div class="summary-stat-label">AUSPICIOUS YOGAS</div>
                </div>
                <div class="summary-stat negative">
                    <div class="summary-stat-number">${negative}</div>
                    <div class="summary-stat-label">CHALLENGING YOGAS</div>
                </div>
                <div class="summary-stat special">
                    <div class="summary-stat-number">${special}</div>
                    <div class="summary-stat-label">SPECIAL YOGAS</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-stat-number" style="color: #D4AF37;">${total}</div>
                    <div class="summary-stat-label">TOTAL YOGAS</div>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <div style="font-weight: bold; color: #333; margin-bottom: 8px;">Yoga Index: <span style="color: ${index.score > 0 ? '#2e7d32' : (index.score < 0 ? '#c62828' : '#666')}">${index.interpretation || 'Neutral'}</span></div>
                <div class="yoga-index-indicator" style="background: linear-gradient(90deg, #d32f2f 0%, #ff9800 25%, #fbc02d 50%, #8bc34a 75%, #4caf50 100%); opacity: 0.8;"></div>
                <div style="font-size: 12px; color: #666;">
                    ${index.positiveScore || 0} Positive Points - ${index.negativeScore || 0} Challenging Points = 
                    <span style="color: ${index.score > 0 ? '#4caf50' : (index.score < 0 ? '#f44336' : '#666')}; font-weight: bold;">
                        ${index.score > 0 ? '+' : ''}${index.score || 0} Net
                    </span>
                </div>
            </div>
    `;
    
    // Add top yogas / Important Yogas section
    if (summary.primaryYogas && summary.primaryYogas.length > 0) {
        html += `<div style="margin-top: 20px; padding: 15px; background: rgba(255,215,0,0.05); border-left: 4px solid #FFD700; border-radius: 5px;">
            <div style="margin-bottom: 12px;">
                <strong style="font-size: 13px; color: #333;">✨ Top Predicted Impacts:</strong>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
        
        summary.primaryYogas.forEach(yoga => {
            const strengthText = typeof yoga.strength === 'object' ? (yoga.strength.level || 'Moderate') : (yoga.strength || 'Moderate');
            html += `<span style="display: inline-block; padding: 5px 12px; background: white; border: 1px solid rgba(212,175,55,0.2); border-radius: 20px; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                🔹 ${yoga.name} <span style="color: #D4AF37; font-weight: bold;">(${strengthText})</span>
            </span>`;
        });
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}

/**
 * Render individual yoga tile
 * @param {Object} yoga - Yoga object from analysis
 * @returns {String} HTML for yoga tile
 */
function renderYogaTile(yoga, shouldHideByDefault = false) {
    if (!yoga || !yoga.name) return '';
    
    const quality = (yoga.quality || 'Special').toLowerCase();
    const strengthClass = `strength-${yoga.strength?.level?.toLowerCase() || 'moderate'}`;
    const keywords = (yoga.keywords || []).slice(0, 3);
    const isReference = yoga.isReference || !yoga.detected;
    const referenceLabel = isReference ? '<span style="font-size: 10px; color: #999; margin-left: 8px;">(Reference)</span>' : '';
    const displayStyle = (isReference && shouldHideByDefault) ? 'style="display: none;"' : '';
    const referenceAttr = isReference ? 'data-reference="true"' : '';
    
    let html = `
        <div class="yoga-tile ${quality}" data-yoga-name="${yoga.name}" data-yoga-quality="${quality}" ${referenceAttr} ${displayStyle}>
            <div class="yoga-name">${yoga.name} ${referenceLabel}</div>
            <span class="yoga-strength-badge ${strengthClass}">
                💪 ${yoga.strength?.level || 'Moderate'} Strength ${yoga.varga ? `(${yoga.varga})` : ''}
            </span>
            <div class="yoga-effect">${yoga.result || yoga.effect || 'Auspicious combination'}</div>
            ${keywords.length > 0 ? `
                <div class="yoga-keywords">
                    ${keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
                </div>
            ` : ''}
            <button class="yoga-remedies-btn" onclick="showYogaDetailModal('${yoga.name}'); return false;">
                📖 View Remedies
            </button>
        </div>
    `;
    
    return html;
}

/**
 * Render filter buttons
 * @returns {String} HTML for filter buttons
 */
function renderFilterButtons() {
    return `
        <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterYogas('all')">All Yogas</button>
            <button class="filter-btn" onclick="filterYogas('positive')">Auspicious ✓</button>
            <button class="filter-btn" onclick="filterYogas('negative')">Challenging ✗</button>
            <button class="filter-btn" onclick="filterYogas('special')">Special ⚡</button>
        </div>
    `;
}

/**
 * Attach event listeners to yoga tiles
 */
function attachYogaTileListeners() {
    document.querySelectorAll('.yoga-tile').forEach(tile => {
        tile.addEventListener('click', function(e) {
            if (e.target.closest('.yoga-remedies-btn')) return;
            const yogaName = this.getAttribute('data-yoga-name');
            showYogaDetailModal(yogaName);
        });
    });
}

/**
 * Attach event listeners to filter buttons
 */
function attachFilterListeners() {
    window.filterYogas = function(filter) {
        const tiles = document.querySelectorAll('.yoga-tile');
        const buttons = document.querySelectorAll('.filter-btn');
        const showAllCheckbox = document.getElementById('show-all-yogas');
        const showAll = showAllCheckbox && showAllCheckbox.checked;
        
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        tiles.forEach(tile => {
            const tileClass = tile.className.split(' ')[1];
            const isReference = tile.getAttribute('data-reference') === 'true';
            let shouldDisplay = true;
            
            // Check filter
            if (filter !== 'all' && filter !== tileClass) {
                shouldDisplay = false;
            }
            
            // Check if should hide reference yogas
            if (isReference && !showAll) {
                shouldDisplay = false;
            }
            
            tile.style.display = shouldDisplay ? '' : 'none';
        });
    };
}

/**
 * Show detailed yoga information in modal
 * @param {String} yogaName - Name of the yoga
 */
function showYogaDetailModal(yogaName) {
    const yoga = window.getYogaByName(yogaName);
    if (!yoga) return;
    
    let modalHTML = `
        <div class="yoga-modal-overlay active" onclick="closeYogaModal()">
            <div class="yoga-modal-content" onclick="event.stopPropagation()">
                <div class="yoga-modal-header">
                    <div>
                        <div style="font-size: 20px; margin-bottom: 5px;">${yoga.name}</div>
                        <div style="font-size: 12px; opacity: 0.9;">${yoga.category || 'Yoga'}</div>
                    </div>
                    <button class="yoga-modal-close" onclick="closeYogaModal()">✕</button>
                </div>
                <div class="yoga-modal-body">
                    ${renderYogaDetailContent(yoga)}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existing = document.querySelector('.yoga-modal-overlay');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Render detailed content for yoga modal
 * @param {Object} yoga - Yoga object
 * @returns {String} HTML for modal body
 */
function renderYogaDetailContent(yoga) {
    let html = `
        ${yoga.rationale ? `
        <div class="remedy-section" style="background: rgba(0,188,212,0.05); border-left-color: #00bcd4;">
            <div class="remedy-section-title" style="color: #008ba3;">Logic / How it Occurred</div>
            <div style="color: #333; line-height: 1.6; font-weight: 500; font-style: italic;">"${yoga.rationale}"</div>
        </div>
        ` : ''}
        
        <div class="remedy-section">
            <div class="remedy-section-title">Formation</div>
            <div style="color: #555; line-height: 1.6;">${yoga.description || 'Classical yoga formation'}</div>
        </div>
        
        <div class="remedy-section">
            <div class="remedy-section-title">Effect</div>
            <div style="color: #555; line-height: 1.6;">${yoga.result || yoga.effect || 'See detailed analysis'}</div>
        </div>
    `;
    
    // Mantras
    if (yoga.mantras && yoga.mantras.length > 0) {
        html += `
            <div class="remedy-section">
                <div class="remedy-section-title">Mantras</div>
                <ul class="remedy-list">
                    ${yoga.mantras.map(m => `<li class="remedy-item">${m}</li>`).join('')}
                </ul>
                <div class="mantra-highlight">
                    🕉️ Chant ${ yoga.mantras[0]} 108 times during morning hours for best results
                </div>
            </div>
        `;
    }
    
    // Remedies
    if (yoga.remedies && yoga.remedies.length > 0) {
        html += `
            <div class="remedy-section">
                <div class="remedy-section-title">Remedial Measures</div>
                <ul class="remedy-list">
                    ${yoga.remedies.map(r => `<li class="remedy-item">${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Deities
    if (yoga.deities && yoga.deities.length > 0) {
        html += `
            <div class="remedy-section">
                <div class="remedy-section-title">Associated Deities</div>
                <div style="color: #555; line-height: 1.6;">
                    🙏 ${yoga.deities.join(' • ')}
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Close yoga modal
/**
 * Close yoga modal
 */
function closeYogaModal() {
    const modal = document.querySelector('.yoga-modal-overlay');
    if (modal) modal.remove();
}

/**
 * Global function to toggle between showing detected yogas vs all yogas
 * By default: Show only detected yogas (applicable to horoscope)
 * When checked: Show ALL 95+ yogas from database (including reference)
 */
window.toggleAllYogas = function(showAll) {
    if (!window.YOGAS_DATA || !Array.isArray(window.YOGAS_DATA)) {
        console.warn('Yoga database not available');
        return;
    }
    
    const container = document.querySelector('.yoga-tile-grid');
    if (!container) return;
    
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Find active filter
    let activeFilter = 'all';
    buttons.forEach(btn => {
        if (btn.classList.contains('active')) {
            const btnText = btn.textContent.toLowerCase();
            if (btnText.includes('auspicious')) activeFilter = 'positive';
            else if (btnText.includes('challenging')) activeFilter = 'negative';
            else if (btnText.includes('special')) activeFilter = 'special';
            else activeFilter = 'all';
        }
    });
    
    if (showAll) {
        // Get already rendered yoga names
        const existingYogaNames = new Set();
        document.querySelectorAll('.yoga-tile').forEach(tile => {
            existingYogaNames.add(tile.getAttribute('data-yoga-name'));
        });
        
        // Add ANY missing yogas from the complete database
        let newTilesHtml = '';
        window.YOGAS_DATA.forEach(yoga => {
            if (!existingYogaNames.has(yoga.name)) {
                const yogaToRender = {
                    ...yoga,
                    detected: false,
                    isReference: true,
                    strength: yoga.strength || 'Moderate'
                };
                newTilesHtml += renderYogaTile(yogaToRender, false); // Don't hide by default
            }
        });
        
        // Add missing yogas to grid
        if (newTilesHtml) {
            container.insertAdjacentHTML('beforeend', newTilesHtml);
            attachYogaTileListeners();
        }
        
        // Show ALL tiles matching current filter
        document.querySelectorAll('.yoga-tile').forEach(tile => {
            const tileClass = tile.className.split(' ')[1];
            const shouldShow = activeFilter === 'all' || activeFilter === tileClass;
            tile.style.display = shouldShow ? '' : 'none';
        });
        
        console.log('✓ Showing all yogas from database');
    } else {
        // Show ONLY detected yogas (hide all reference yogas)
        document.querySelectorAll('.yoga-tile').forEach(tile => {
            const isReference = tile.getAttribute('data-reference') === 'true';
            const tileClass = tile.className.split(' ')[1];
            
            if (isReference) {
                tile.style.display = 'none'; // Hide reference yogas
            } else {
                // Show detected yogas that match current filter
                const shouldShow = activeFilter === 'all' || activeFilter === tileClass;
                tile.style.display = shouldShow ? '' : 'none';
            }
        });
        
        console.log('✓ Showing only detected yogas');
    }
};

// Make functions globally accessible
window.showYogaDetailModal = showYogaDetailModal;
window.closeYogaModal = closeYogaModal;
window.renderYogasDashboard = renderYogasDashboard;
window.initializeYogaDashboard = initializeYogaDashboard;
