/**
 * KP Part 14 — photographed "Krishnamurti Paddhatinusaar Ansh Phale" pages.
 * Source: user-provided Jyotish Sobati p.258 book rule, pages p.259 (Aries),
 * p.261 (Gemini), p.263 (Leo), p.265 (Libra). Existing Part 11 records p.260,
 * p.262, p.264, p.266, p.268, p.270 are preserved.
 * p.267 Sagittarius (167-188) and p.269 Aquarius (208-228) are NOT supplied.
 * Transcriptions are selected legible Marathi phrases, not translations or
 * complete quotations. Please verify against the photographs before publication.
 * All results are traditional cultural reference material, NOT health diagnosis,
 * occupational suitability or a reliable prediction of personality/events.
 */
(function () {
  'use strict';
  const book = window.KP_PREDICTION_11;
  if (!book) return;
  const ADDITIONS = {"1":["शत्रुचिंता, मत्सरी","बेहोशी, मेंदू विकार, फेफरे, शिरदुखणे, अपघात","लष्कर, यंत्रसंबंधी"],"2":["चिंता परदारा, अंगात येणे","डोके-नेत्रविकृती, गुप्तरोग, दाह, गोवर","रेल्वे, कारखाने, जॉकी, मोटर उद्योग"],"3":["मानी, अहंकारी, दुर्बलांचे संरक्षण, नेतृत्व","अर्शरोग, बेहोशी, लाल डोळे, अनेमिया, वेदना, गळवे","वैद्यक, फायरब्रिगेड, फौजदारी कोर्ट, तांबे, तुरुंग, नोकरी"],"4":["वाचकी, कुंडाळात भांडणे","मानसिक चिंता, मेंदू रोग, वात, निराशा, उन्माद","रेल्वे, बॉयलर, स्थावर, प्रवासी उद्योग"],"5":["हिसाचारी, कुंडाळात तंटे","फेफरे, गळवे, अपघात, मेंदूत रक्तस्राव, शिरोरुग्ण, उन्माद","पोलीस, लष्कर, स्वतंत्र व्यवसाय, संचालक"],"6":["चिडखोर, करणीबाधा, कर्जे-दलाली करणारा","कुत्रे चावणे, रोगी, मनोरोग","तुरुंग, पोलीस लष्कर"],"7":["शूर, उदार, धार्मिक","मेंदू, हिवताप, मेनिंजायटिस","बँक, व्यवस्थापक, न्यायाधीश, धार्मिक संस्था, फौजदारी वकील, अध्यापक"],"8":["चिडखोर, खुनशी","निद्रानाश, देवी, गळवे, मेंदू रोग, बेहोशी, स्त्री रोग, डोक्यदुखी","पोलाद, खनिज, स्थावर, मैत्री, विभाग प्रमुख"],"9":["बलात्कार, भांडखोर, हुशार, खोटे बोलणारा","फेफरे, पेटके, अपंग, वेदना","लेखनिक, टंकक, फॅक्टरी इंजि., इस्टेट एजंट"],"10":["विलासी, धूम्रपान, कलाकार","नेत्रविकार, डोळ्यावर जखम","खेळाडू, वाद्य, P.R.O., प्रदर्शन, प्रसूतीगृह"],"11":["दिलदार, निर्धारी, विलासी","सर्दी, नेत्रपीडा, मोतीबिंदू","जाहिरात, रेल्वे, फौज, वकील, पशु-शास्त्रवेत्ता, जनावरे, सरकारी नोकरी"],"12":["मद्याशक्त, लोभी, अनितीमान, हुशार","रक्तदोष, मेंदुविकृती","रेशीम कापूस, खत, चहा, कॉफी, हॉटेल, शेती, गोदी"],"13":["चलाख, चपळ, विलासी, निरोगी, सुखासीन","गुह्यरोग","नर्तकी, खेळाडू, चांदीची भांडी, चिप्स, काच, चित्रपट, विवाह कार्यालय"],"14":["महत्त्वाकांक्षी, ऐहिकोपभोग","कोंड, कुष्ठ, गुह्यरोग","खाटिक, मोटर, मोठा उद्योग"],"15":["भोगी, हुशार, आनंदी, स्पष्टशील, उच्च विद्याविभाग","अपघातातून वाचतो, गुप्तरोग","खेळाडू, सुवर्णकार, न्यायाधीश, अध्यापन, स्थावर, शेती, आयकर, पशुसंवर्धन, थिएटर"],"16":["हीन कुलोत्पन्न, संयुजीत, स्त्रैण, अपकीर्ती, काटकुळा","कफ, सर्दी","खत, खनिज, खाटिकखाना, कुस्ती, वाहतूक, शेती, पुरुषांचे वस्त्र"],"17":["चंचल, हुशार, फसवाफसवी, खेळाडू","मेंदुरोग, फिट्स","शस्त्रवेत्ता, लैंगिक लेखन, इंजि. कॉन्ट्रॅक्टर, आयात निर्यात, खाद्य पुरवठा"],"18":["द्वेषी, मत्सरी","रोगट, कोंड, गुप्तरोग, अधू दृष्टी","कंद, बी-वियाणे, पशुवैद्य, चर्मशिल्प"],"19":["धीट, चलाख, संधेेबाज","प्लेग, मेंदू रोग, पाठदुखी, हृदयविकार","लष्कर, पोलीस, सर्जन, सरकारी अधिकारी"],"20":["पिळदार, धडधड्या, प्रसिद्ध","काळजी, कंजण्या","नौदल, प्रवासी, रसायने उत्पादक, स्थावर, औषधे"],"21":["निकोपी, स्वाभावदार, भिमाड, लढाऊ, वादपटू","ताप, पुरुष, मेंदूत पाणी, कापणे, अपघात, हिवताप","स्फोटके, काड्यापेट्या, पोलादी भांडी, लष्करी सामग्री"],"22":["पुढारी वृत्ती, आकर्षक, खटाटोप, पदार्पणालाभी","लेग, हातरोग, भांजणे, मनोरोग","तुरुंग, पोलीस, रसायन, राजीनामा देण्याची वेळ"],"42":["खादाड, उत्साही, सावध, वादविवादपटू","खांद्यावर जखम, त्वचेचे दोष","विद्युत यंत्र, रेल्वे, तार, रेडिओ, गणक यंत्र, बांधकाम, पत्रकार, छापखाना, वकील"],"43":["शीघ्रकोपी, चौचक","रक्तदोष, ताप, क्षयासारखे रोग","फॅक्टरी, इंजिनिअरिंग, व्यापार, तार, यंत्रकाम"],"44":["चपळ, उत्साही, आकर्षक, कामुक, श्रीमंत, हजरजबाबी","खांद्याचे हाड, मनोविकृती","यंत्र, इलेक्ट्रॉनिक, राजदूत, व्यापारी, केबल्स, खनिज, पशु, धन, दूत, एजंट"],"45":["शीघ्रकोपी, वक्ता, कार्यकुशल, हस्तकौशल्य, नेतृत्वगुण","घसा, आवाज, ENT","रेडिओ, तार, वीज, शस्त्रवैद्य, पत्रकार, सैनिक"],"46":["भावनाविलसित, मिस्कील, कल्पक, वक्ता, कार्यकुशल","खांदे, बरगड्या, हृदय, पाठ आणि हातांचे विकार","गणिती, ब्रोकर, विक्रेता, पूल बांधकाम, राजदूत, बस वाहतूक"],"47":["खोटारडा, कृतघ्न, दारुरुणी, विद्रोह, अपयश","घसा, थायरॉईड, गळवे, गुह्यरोग","संशोधन, अणुशक्ती, लेखन"],"48":["चारित्र्यवान, चतुर","घशाचे विकार, श्वास, जंत संसर्ग, मनोविकार, ENT, गलगंड","लेखक, संशोधक, संख्याशास्त्र, भांडार, ब्रोकर, पत्रकार"],"49":["असंशोधित, दुष्ट","दमा, कानात पू, क्षय","ठेकेदार, छोटे दस्तऐवज, पदार्थ विज्ञान"],"50":["हुशार, मिस्कील","उचकी, कानाचा त्रास","विक्रेता, दळणवळण, लेखन, अणुशास्त्री, टंकन, वाहतूक"],"51":["मत्सरी, व्यभिचारी, चोर, दुष्ट, कृतघ्न","घसा, घटसर्प, क्षय, जंत संसर्ग, कुष्ठ","संशोधन, विस्फोटके, हत्यार उद्योग, पत्रलेखन"],"52":["चतुर, विनोदी, कलावंत","नाक-कान-घसा विकार, कोरडा खोकला","विक्रेता, वाहतूक, रेडिओ, P & T, वस्त्र कलावंत, लेखक"],"53":["क्रूर, विश्वासघात","खांदा दुखी","संशोधन, अणुशास्त्री, सार्वजनिक काम"],"54":["अंतर्ज्ञानी, अस्वस्थ","दमा, कान, मनोविकार","खलाशी, औषधे, नर्स, संशोधन, इंजिनिअर"],"55":["टीकाकार, खुनी, लुच्चक","घसा, खांदा दुखणे, गुप्तरोग","फॅक्टरी इंजिनिअर, ठसे तज्ञ, पोलीस, तुरुंग"],"56":["सत्यवादी, श्रीमंत","कानाला सूज, स्थूलता, मधुमेह","पत्रकार, लेखक, ज्योतिषी, नगराध्यक्ष, व्यापारी"],"57":["विद्वान, निष्ठावान","खांदा, कान, घसा विकार","विमा, पोस्टमन, लॉकर, नोकरी, किरणे, अनेस्थेशिया, अकाउंटंट"],"58":["विद्वान, वक्ता, विनोदी","उचकी, दमा","संशोधक, परीक्षक, ज्योतिषी, पत्रकार"],"59":["चिंताग्रस्त, चुकीचे निर्णय","न्यूमोनिया, प्लूरसी","दुभाषी, चित्रपट, ज्योतिषी"],"60":["स्मरणशक्ती उत्तम, योग्य निर्णय","ब्रॉन्कायटिस","कवी, न्याय, सिव्हिल इंजिनिअर, पंडित, कापड"],"61":["उत्तम दृष्टी, आनंदी, उदार","घसा-कान विकार, ब्रॉन्कायटिस, हृदयविकार","जाहिरात, न्याय, आयकर, उपसचिव, रिझर्वेशन"],"62":["अंतर्ज्ञानी, चंचल, बोलका, अनेक भाषा","न्यूमोनिया, प्लूरसी, मानसिक विकार","व्यापारी, इस्टेट ब्रोकर, राजकारणी, नगरसेवक, शिक्षक, दुभाषी"],"84":["उदासीन, मानी","हृदय विकार, चक्कर, मनोरुग्ण","रसायन, वैद्यक, सरकारी नोकरी"],"85":["कलाप्रेमी, मित्रप्रिय","मेनिंजायटिस, पाठदुखी, कुष्ठ, अपस्मार","त्वचारोग तज्ञ, नेत्रवैद्य, वाहतूक, स्त्रीरोग, वैद्य, नट"],"86":["खंबीर, कार्यकुशल, नेतृत्वगुण","उष्ण, उष्माघात, बेहोशी, नेत्रविकार, हृदयविकार, पाठदुखी","वैद्यक, सरकारी अधिकारी, नट"],"87":["चंचल, कटकट्या, भावनाप्रधान","अग्निमांद्य, स्नायू, डोकेदुखी, मनोविकार, गळवे","नाविक, बॉयलर, पत्रवाहिका, औषधे"],"88":["तापट, भांडखोर, साहसी","अपस्मार, हृदयविकार, कण्याचे रोग","कर्जे, संरक्षण, पोलीस, उद्योगधंदे, नट"],"89":["भीती, विसंवाद, दुष्ट","मनोविकार, रक्तदोष, करणी, मेनिंजायटिस","तुरुंगाधिकारी, चित्रपट, क्ष किरण"],"90":["तत्त्वज्ञ, धार्मिक, बुद्धिमान, भाग्यवान","कॅन्सर, यकृत विकार","बँक, वकील, न्यायदान, नेता, अध्यापन, अधिकारी"],"91":["अहंकारी, कुकर्मी","संधिवात, अतिस्वेद, दीर्घरोगी, पाठीचे विकार, वेदना, चक्कर","खाते प्रमुख, तांबे, लोखंड, होमिओपॅथी"],"92":["तोलका, बहुश्रुत","मानसिक रोग, हृदयविकार","लेखनिक, पत्रकार, जाहिरात, ऑडिट, टपालतार खाते"],"93":["सुंदर, उदार, नम्र, लोकात मिसळणारा, स्त्री/माता रोगी","नेत्रविकार, गुह्यविकार","व्यापार, समाजकार्य, संगीत, कला, रसायन"],"94":["लोकात मिसळणारा, नेतृत्व गुण, उदार","नेत्र, हृदयविकार, पाठदुखी","रुग्णालय, रसायन, रेडिओ, स्टॉक एक्सचेंज, सरकारी अधिकारी"],"95":["मनमोकळा, समाजप्रिय, प्रेमप्रकरणे, ऐषाराम","टॉन्सिल, गर्भाशय","अत्तरे, नाविक, तेलगुंडळी, रंग, दूध, खाद्य पदार्थ"],"96":["सुखासक्त, साहसी, रंगेल, उघळा","गुप्तरोग, उष्णतेचे विकार, नेत्रविकार","वाहतूक, जाहिरात, रसायन, पेट्रोल, इंजिनिअर, शस्त्रक्रिया साधने, छायाचित्र, पोलीस, नट"],"97":["कलाकार, हट्टी, आकर्षक","रोगी, नेत्रविकार, मानसिक त्रास","छायाचित्र, तुरुंग, नट"],"98":["आनंदी, अभ्यासू, धार्मिक, परोपकारी","रक्तविकार, मधुमेह, ताप, गळवे, सूज","न्यायाधीश, आयकर, स्त्रीशिक्षण, रुग्णालय, पशुसंगोपन, वाहतूक"],"99":["अहंकारी, कमी बोलणे, दुष्कर्मी","थापडी-कातडी, दंत व अस्थी विकार","त्वचारोग तज्ञ, कातडेवाले, सॅनिटरी इंजिनिअर"],"100":["कलाप्रेमी, आनंदी","हृदयविकार, पाठदुखी, मनोविकार","रसायन, औषध विक्रेता, पत्रकार, लेखक"],"101":["दुष्ट, संशयी, मांत्रिक","मेनिंजायटिस, पाठदुखी, कुष्ठ, नेत्रविकार","त्वचा-नेत्र-स्त्री वैद्य, वाहतूक, रसायन, पॅथॉलॉजी, एक्स-रे"],"102":["निरोगी, लोकादरास पात्र, सच्चे प्रेम","उष्माघात, नेत्र, हृदय, कणा विकार, टायफाईड","उच्चपद, जवाहिर, वैद्यक, पोलीस, खेळ, सिनेमा, सट्टे"],"103":["चंचल, उत्साही, प्रेमळ","ब्लडप्रेशर, पुरुष, देवी, अतिसार","नौ अधिकारी, द्रव पदार्थ, टॉनिक्स, मेकॅनिकल इंजिनिअर"],"104":["धडधाकट, आकर्षक, तापट, उच्च शिक्षित, दूरचे प्रवास","छातीचे विकार, अपस्मार, उष्णतेचे रोग","स्थावर, श्रीमंत, स्टॉक एक्सचेंज, युद्धसाहित्य, लॉटरी, पोलीस"],"105":["परस्त्रीसक्त, गृहसौख्यहीन","प्लेग, ताप, जिवाणूपासून रोग","तुरुंगाधिकारी, एक्स-रे तज्ञ, चित्रपट, छायाचित्र, नट"],"125":["शांत, सौम्य, विवेकी, अंतर्ज्ञानी, बुद्धिमान, फेटाळणारे बोलणे, उत्तम शिरक","गर्भाशय शस्त्रक्रिया, अर्धांग","जागा सल्लागार, इंजिनिअर, आर्किटेक्ट, शेती, डेकोरेशन, पेंटर, लेखक, प्रकाशक"],"126":["संसारी","कण्याचा विकार, नेत्ररोग, मानसिक रोग","सरकारी, पर्यटनयोग"],"127":["समतोल, विवेकी, सुखी, परोपकारी, प्रसन्न, कानुक, उघळ, संपन्न, हुशार, प्रामाणिक","अपेंडिसायटिस, गुह्यरोग","चिकित्सा, रसायने, रसायन रंग, नायक"],"128":["दिलदार, कामुक, निरोगी","मूत्रमार्ग, ओव्हरीचे ग्रंथी विकार, अल्सर, पाठीच्या हाडे, रोग, ए. सी., मानसिक रोग","चालक, लष्कर वैद्यक, नट"],"129":["पंचकर्मी, गजकरणी, फलदायक, सौम्य","गुह्यरोग, मनोरोग","परिचारक, किरण, दूध, खाद्य"],"130":["संवेदनशील, कृतज्ञ, विच्छिद्र","गुह्यरोग, मनोरोग","छायाचित्र, अणुशक्ती"],"131":["श्रद्धाळू, न्यायी, धार्मिक","कॅन्सर, यकृत विकार, त्वचा","बँक, वाचक, कला, अध्यापक, धर्मगुरू"],"132":["हट्टी, बुद्धिमान","त्वचा विकार, कुष्ठ, मूत्रपिंड","साहित्य, न्याय, टेस्ट्स, वकील, पेट्रोलियम व खनिजे"],"133":["चिंतातूर, ऋणग्रस्त, कलाकार, गोड बोलणूक, वक्ता","कुष्ठ, त्वचा विकार","चिकित्सा, सुगंधी द्रव्ये, संगीत लेखन"],"134":["भांडखोर, करणी, उदासीन","रोगी, मनोरोग","लाकूड, कांच, प्लास्टिक"],"135":["कलाकार, विवेकी, बुद्धिमान, मानसिक चिंता","रोगी, गुह्यरोग","कागद, रसायन, रंग, कवी, कलाकार"],"136":["क्रूर, विश्वासघातकी, नेत्रदुर्गुण","खांदा, पाठदुखी, नेत्र रोग, हृदय विकार","स्वायत्तसंस्था, लोकर, तुरुंग रसायने, सरकारी नोकरी, नट"],"137":["चंचल, परावलंबी, परोपकारी, भावनाप्रधान","सर्दी, कर्ण विकार, नेत्र रोग","प्लास्टिक रंग, खाद्य पदार्थ, मासेमारी, तंबाखू, परिचारिका"],"138":["टीकाकार, विषयी, दुष्कर्मी, खेळाडू, आकर्षक","मूत्रपिंड, गुह्यविकार, उष्णतेचे विकार","तपकीर, टॅक्सी, सिनेमा, नट, खेळाडू"],"139":["उच्चच्या, सुंदर छानछोकी, सभ्य, उदार, प्रेमविवाह","कॅन्सर, ओव्हरीचे ग्रंथी, अंतर्गठ","न्यायाधीश, आयकर, सल्लागार, स्त्री शिक्षण"],"140":["सुखासीन, अप्रामाणिक, धार्मिक, स्वयंकेंद्रित","जुनाट रोग, मूत्रपिंड विकार, त्वचा व अस्थीविकार","महसूल बँक, न्याय, कायदा, वाहतूक"],"141":["बुद्धिमान, शास्त्राभ्यासी, उदार, संभाषणचतुर, भोगी, जुळे भावंड","दमा, आरोपीची काळजी घेणारा","विक्रेता, लेखक, प्रचारक, अकाउंटंट, प्लास्टिक, कांच"],"142":["गुप्तसंदेह, सहानुभूतीचे संकट","गर्भपात, गुह्यविकार, मानसिक ताण","अध्यापन, कलाकार, वकील, धर्मगुरू"],"143":["शांत, अचूक निर्णय, निकोप, भावंडे व शेजाऱ्यांशी वितुष्ट","अति खाणे, मेंदूदुखी, गुह्यविकार","न्याय, बँक, आयकर, वाहतूक-हवाई, कापड उद्योग, प्रवास"],"144":["सुदृढ, सुंदर, दिलदार, प्रेमविवाह","नेत्र विकार, हृदय विकार, पाठदुखी","औषधे, रसायन, आयकर, न्याय रुग्णालये, धर्मसंस्था"],"145":["अंतर्ज्ञानी, कलाकार, प्रेमळ","मूत्रपिंड विकार, मानसिक ताण, पोटाचे विकार","नर्स, पेट्रोल, तेल, आरसे, यंत्र सामान, नौकानयन, सौंदर्यप्रसाधन"]};
  Object.keys(ADDITIONS).forEach(n => { book.ANSH_TEXT[n] = ADDITIONS[n]; });
  // 206/249 text rows; only rows 167-188 and 208-228 still lack photos.
  book.TEXT_ROW_RANGES = [[1,166],[189,207],[229,249]];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const format = x => typeof x === 'number' && Number.isFinite(x) ? x.toFixed(6) + '°' : '—';
  const SOURCE_PAGE = [259,260,261,262,263,264,265,266,267,268,269,270];
  const keyNames = {nature:'स्वभाव / गुण · Nature', disease:'रोग · Diseases', profession:'व्यवसाय · Profession'};
  function record(no) {
    const row=book.build249Table()[Number(no)-1];
    if (!row || row.no!==Number(no)) return null;
    return {row,text:book.getText(row.no),sourcePage:SOURCE_PAGE[row.signIdx],
      excerpt: Object.prototype.hasOwnProperty.call(ADDITIONS,String(no))};
  }
  function coverage() {
    const loaded=Object.keys(book.ANSH_TEXT).filter(n => book.getText(Number(n))).length;
    return {loaded,total:249,missing:249-loaded,missingRanges:[[167,188],[208,228]]};
  }
  function getLive() {
    const asc=window.BIRTH_ASC, birth=window.BIRTH;
    if(!asc || !Number.isFinite(asc.sid)) return {error:'Calculate natal D1 birth details before viewing the KP book entries.'};
    const result={ascSid:asc.sid,asc:book.describePoint('1st cusp / Lagna',asc.sid),cuspMethod:'unknown'};
    try {
      const part12=window.KP_PREDICTION_12;
      if(!birth || !part12 || typeof part12.getCusps !== 'function')
        throw new Error('Placidus cusp calculator is unavailable.');
      const c=part12.getCusps(birth);
      if(!c || !Array.isArray(c.cusps) || c.cusps.length!==12 || !c.cusps.every(Number.isFinite))
        throw new Error('Placidus cusp calculation returned missing/invalid values.');
      const delta=((c.cusps[0]-asc.sid+540)%360)-180;
      if(Math.abs(delta)>0.5) throw new Error('KP Placidus cusp 1 and natal Ascendant differ by '+Math.abs(delta).toFixed(3)+'°; check ephemeris and ayanamsa.');
      result.cusps=c.cusps.slice();result.cuspMethod='Natal Placidus';
      result.sixth=book.describePoint('6th cusp / रोग',c.cusps[5]);
      result.tenth=book.describePoint('10th cusp / व्यवसाय',c.cusps[9]);
      result.fourth=book.describePoint('4th cusp / spouse profession',c.cusps[3]);
    } catch(err) {result.error=err.message;}
    return result;
  }
  function byDegrees(ascSid,cusps) {
    // Explicit input for deterministic tests and imported charts. No equal-house fallback.
    const asc=book.describePoint('1st cusp / Lagna',ascSid);
    if(!Array.isArray(cusps)||cusps.length!==12||!cusps.every(Number.isFinite))return {asc,ascSid,error:'12 valid Placidus cusp longitudes required'};
    return {asc,ascSid,cusps,cuspMethod:'Placidus (provided)',
      sixth:book.describePoint('6th cusp / रोग',cusps[5]),
      tenth:book.describePoint('10th cusp / व्यवसाय',cusps[9]),
      fourth:book.describePoint('4th cusp / spouse profession',cusps[3])};
  }
  function renderOne(pt,field) {
    if(!pt) return '';
    const r=record(pt.row.no),value=(pt.text&&pt.text[field])||'';
    const src=r?'p. '+r.sourcePage+(r.excerpt?' · photographed excerpt':' · existing transcription'):'';
    return '<div style="border:1px solid rgba(200,168,75,.22);border-radius:7px;padding:9px;margin:6px 0;">'+
      '<div style="font-size:11px;font-weight:700;color:#deb96f">'+esc(keyNames[field])+'</div>'+
      '<div style="font-size:10px;color:var(--muted);padding:3px 0;">'+esc(pt.label)+
      ' · KP '+r.row.no+' · '+esc(book.SIGN_MR[r.row.signIdx])+' · '+esc(book.fmtStart(r.row))+
      ' · '+esc(r.row.nakLord)+' / '+esc(r.row.subLord)+' · '+esc(src)+' · '+esc(format(pt.sidLon))+'</div>'+
      (value ? '<div style="line-height:1.65;font-size:12px;color:var(--text)">'+esc(value)+'</div>' :
      '<div style="font-size:11px;color:var(--muted)">Reference text unavailable for this row (missing photographed page). No guess substituted.</div>')+'</div>';
  }
  const intro='<div style="font-size:11px;line-height:1.55;color:var(--muted);margin:5px 0 8px;">' +
    'Jyotish Sobati · कृष्णमूर्ती पद्धतीनुसार अंश फले · 249 divisions. Historical Marathi source associations only; ' +
    'not a medical diagnosis, personality assessment, or evidence of professional aptitude. ' +
    'Photographed entries are excerpts; some scanned words require proofreading.</div>';
  function wrapHtml(label,color,body,reading) {
    const cov=coverage();
    return '<section class="biz-summary" data-kp14="'+esc(label)+'" style="border:1px solid rgba(200,168,75,.35);padding:12px;border-radius:10px;margin:12px 0;background:rgba(200,168,75,.035);">'+
      '<h3 style="color:'+color+';font-size:13px;margin:0 0 6px;">📖 KP 249 अंश फले — '+esc(label)+'</h3>'+
      '<div style="font-size:10px;color:var(--muted)">Reference coverage: '+cov.loaded+' / 249 rows · Missing: Sagittarius (167–188), Aquarius (208–228)</div>'+
      intro+ (reading.error?'<div style="border:1px solid #b88;padding:8px;font-size:11px;color:var(--text)">Cusp-specific results withheld: '+esc(reading.error)+'</div>':'<div style="font-size:10px;color:var(--muted)">House calculation: '+esc(reading.cuspMethod)+'</div>')+
      body+'</section>';
  }
  function renderDiseases(reading=getLive()) {
    return wrapHtml('स्वभाव / रोग · Nature and Diseases','#ed9999',
      renderOne(reading.asc,'nature')+renderOne(reading.sixth,'disease')+
      '<div style="font-size:10px;color:var(--muted);margin-top:7px;">Book p.258: nature from Lagna, disease references from 6th cusp. These are historical associations; they do not indicate that a condition is present or will occur.</div>', reading);
  }
  function renderBusiness(reading=getLive()) {
    return wrapHtml('व्यवसाय · Profession','#d8bc72',
      renderOne(reading.tenth,'profession')+renderOne(reading.fourth,'profession')+
      renderOne(reading.asc,'nature')+
      '<div style="font-size:10px;color:var(--muted);margin-top:7px;">Book p.258: 10th cusp = native profession associations, 4th cusp = future spouse’s profession associations; Lagna = nature. Not a basis for employment or financial decisions.</div>',reading);
  }
  // Replaces Part 11's older render that silently used equal-house cusps.
  function renderForPanel(ctx) {
    if(!ctx||!ctx.natalAsc)return '';
    const reading=getLive();
    return wrapHtml('स्वभाव / रोग / व्यवसाय · Full reference','#d8bc72',
      renderOne(reading.asc,'nature')+renderOne(reading.sixth,'disease')+
      renderOne(reading.tenth,'profession')+renderOne(reading.fourth,'profession'),reading);
  }
  book.getCoverage=coverage;
  book.getAnshRecord=record;
  book.getAnshLive=getLive;
  book.readChartFromCusps=byDegrees;
  book.renderForDiseasePanel=renderDiseases;
  book.renderForBusinessPanel=renderBusiness;
  book.renderForPanel=renderForPanel;
  window.KP_PREDICTION_14={entries:ADDITIONS,coverage,getLive,byDegrees,renderDiseases,renderBusiness,record};
})();
