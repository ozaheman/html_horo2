self.window = self;

self.onmessage = function(e) {
  const { action, payload } = e.data;
  
  try {
    if (action === 'hit_astrology') {
      if (!self.HitAstrologyEngine) {
        importScripts('./predictions/hit_astrology.js');
      }
      const html = self.HitAstrologyEngine.generateReport(
         payload.natalPlanets, 
         payload.ascendant, 
         payload.transitPlanets, 
         payload.currentDate
      );
      self.postMessage({ action: 'hit_astrology_done', html: html });
    } else if (action === 'yogas_analysis') {
      if (!self.getAllYogas) {
        importScripts('./yogas_data.js', './yoga_engine.js', './yoga_implementations.js');
      }
      
      const appliedYogas = self.getAllYogas(payload.vargas);
      
      if(appliedYogas.length === 0) {
        self.postMessage({ action: 'yogas_analysis_done', html: '<div style="padding:40px;text-align:center;color:var(--muted);font-size:12px;">No major Yogas identified in this chart.</div>' });
        return;
      }
      
      let html = '<div style="display:grid;gap:12px;">';
      appliedYogas.forEach(y => {
        let qColor = 'var(--muted)';
        if(y.quality === 'Positive') qColor = 'var(--green)';
        else if(y.quality === 'Negative') qColor = 'var(--rose)';
        else if(y.quality === 'Mixed') qColor = 'var(--gold)';

        let triggeringPlanetsHtml = '';
        if (y.triggeringPlanets && y.triggeringPlanets.length > 0) {
            triggeringPlanetsHtml = `<div style="margin: 8px 0; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.1); display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
              <span style="font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-right:4px;">Triggering Positions:</span>
              ${y.triggeringPlanets.map(tp => `<span style="font-size:9.5px; background:rgba(0,188,212,0.15); color:var(--cyan); border:1px solid rgba(0,188,212,0.3); padding:2px 6px; border-radius:4px; font-family:'Courier New',monospace;">${tp}</span>`).join('')}
            </div>`;
        }

        html += `
        <div style="background:rgba(20,20,40,0.5);border:1px solid var(--border);border-left:3px solid ${qColor};border-radius:4px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <h3 style="color:var(--gold);font-size:12px;margin:0;">${y.name}</h3>
            <span style="font-size:9px;padding:2px 6px;border-radius:2px;background:${qColor}22;color:${qColor};">${y.activeChart} | ${y.quality}</span>
          </div>
          <div style="font-size:10px;color:var(--cyan);margin-bottom:6px;font-style:italic;">"${y.description}"</div>
          ${y.rationale ? `<div style="background:rgba(0,188,212,0.1);padding:6px;border-radius:3px;margin:8px 0;font-size:10.5px;color:var(--cyan);border-left:2px solid var(--cyan);"><strong>Why:</strong> ${y.rationale}</div>` : ''}
          ${triggeringPlanetsHtml}
          <div style="font-size:10.5px;color:var(--text);line-height:1.4;margin-top:6px;">${y.result}</div>
        </div>`;
      });
      html += '</div>';
      self.postMessage({ action: 'yogas_analysis_done', html: html });
    }
  } catch(err) {
    self.postMessage({ action: action + '_error', error: err.message, stack: err.stack });
  }
};
