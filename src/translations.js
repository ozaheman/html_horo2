window.I18N = {
  current: 'en',
  
  dictionary: {
    'hi': {
      'Sun': 'सूर्य (Surya)',
      'Moon': 'चन्द्र (Chandra)',
      'Mars': 'मंगल (Mangal)',
      'Mercury': 'बुध (Budh)',
      'Jupiter': 'गुरु (Guru)',
      'Venus': 'शुक्र (Shukra)',
      'Saturn': 'शनि (Shani)',
      'Rahu': 'राहु (Rahu)',
      'Ketu': 'केतु (Ketu)',
      
      'Aries': 'मेष (Aries)',
      'Taurus': 'वृषभ (Taurus)',
      'Gemini': 'मिथुन (Gemini)',
      'Cancer': 'कर्क (Cancer)',
      'Leo': 'सिंह (Leo)',
      'Virgo': 'कन्या (Virgo)',
      'Libra': 'तुला (Libra)',
      'Scorpio': 'वृश्चिक (Scorpio)',
      'Sagittarius': 'धनु (Sagittarius)',
      'Capricorn': 'मकर (Capricorn)',
      'Aquarius': 'कुंभ (Aquarius)',
      'Pisces': 'मीन (Pisces)',
      
      'Prediction': 'भविष्यवाणी (Prediction)',
      'Current Dasha': 'वर्तमान दशा (Current Dasha)',
      'Upcoming Dasha Changes': 'आगामी दशाएं (Upcoming Dashas)',
      'Natal Degrees': 'जन्म कुण्डली की डिग्री (Natal Degrees)',
      'Varshaphala': 'वर्षफल (Varshaphala)',
      'Tajaka Sahams': 'ताजिक सहम (Tajaka Sahams)',
      'Daily Preview': 'दैनिक पूर्वावलोकन (Daily Preview)',
      'Career Promise': 'आजीविका (Career)',
      'Marriage Timing': 'विवाह का समय (Marriage)',
      'Active Saham Combinations Today': 'आज सक्रिय सहम (Active Sahams)',
      'Muntha': 'मुन्था (Muntha)',
      'Year Lord': 'वर्षेश (Year Lord)',
      'Formula': 'सूत्र (Formula)'
    }
  },
  
  t(text) {
    if (this.current === 'en') return text;
    // Iterate over keys to find matching English text
    for (const [enKey, hiValue] of Object.entries(this.dictionary['hi'])) {
      if (text.includes(enKey)) {
        // simple text replacement for known words
        text = text.replace(new RegExp(enKey, 'g'), hiValue);
      }
    }
    return text;
  }
};
