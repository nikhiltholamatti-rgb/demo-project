import { Culture } from '../types';

export const INITIAL_CULTURES: Culture[] = [
  {
    id: 'culture-kathakali',
    slug: 'kathakali',
    name: 'Kathakali',
    canonicalName: 'Kathakali (കഥകളി)',
    category: 'Classical Dance',
    region: 'Kerala, South India',
    overview:
      'Kathakali is one of the major forms of classical Indian dance, renowned for its elaborate, colorful makeup, magnificent headgear, dramatic facial expressions, and stylized body movements illustrating Hindu epics.',
    history:
      'Originating in 17th-century Kerala under the patronage of the Raja of Kottarakkara, Kathakali evolved from earlier temple theatre traditions such as Krishnanattam and Ramanattam, synthesizing ancient Sanskrit drama principles from the Natya Shastra with local ritual martial arts.',
    significance:
      'It represents the grand eternal cosmic contest between virtue (Dharma) and vice (Adharma). Performances traditionally unfold overnight in temple courtyards illuminated by the warm, flickering glow of the brass Kalivilakku oil lamp.',
    performanceStyle:
      'A non-speaking actor-dancer communicates entirely through intricate Mudras (24 root hand gestures), Navarasas (nine facial emotional states), subtle rhythmic footwork (Kalashams), and intense eye movements (Netra Abhinaya).',
    costumes:
      'Aharya Abhinaya features complex face makeup categorized into Paccha (green, noble gods and heroes), Kathi (knife-style, villains with streaks of virtue), Kari (black, demonesses), Thadi (bearded characters: red, white, or black), and Minukku (soft saffron-amber, women, sages, and brahmins). Performers wear majestic gilded crowns (Kireedam) and layered billowing skirts.',
    instruments:
      'Percussive heartbeat driven by the Chenda (cylindrical drum), Maddalam (horizontal barrel drum), Chengila (bronze gong), and Ilathalam (heavy brass cymbals), accompanied by two Sopanam-style vocalists.',
    traditions:
      'Historically performed in temple precincts (Koothambalam) following sunset oil-lamp lighting, opening with the resonant invocation rhythm known as Kelikottu.',
    bannerUrl:
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80',
    accentColor: '#388e3c',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-yakshagana',
    slug: 'yakshagana',
    name: 'Yakshagana',
    canonicalName: 'Yakshagana (ಯಕ್ಷಗಾನ)',
    category: 'Folk & Ritual Theatre',
    region: 'Coastal Karnataka, South India',
    overview:
      'Yakshagana is a traditional theatre form combining vibrant dance, music, extemporaneous dialogue, grand turbans, and striking face painting, enacting stories from the Mahabharata, Ramayana, and Bhagavata.',
    history:
      'Evolving between the 11th and 16th centuries during the Bhakti movement in Karnataka, Yakshagana drew inspiration from Gandharva grama musical traditions and Vaishnava devotional epics.',
    significance:
      'A living community heritage that bridges folk ritual with profound moral philosophy, staged in open-air paddies after harvest (Bayalata) or inside temple grounds.',
    performanceStyle:
      'Distinguished by energetic pirouettes, high knee lifts, and dynamic verbal debates between characters guided live by the Bhagavata (troupe leader and lead singer). Split into Badagu Tittu (Northern style) and Tenku Tittu (Southern style).',
    costumes:
      'Towering embellished headdresses (Mundale / Pagade), vibrant breastplates (Bhujakeerthi), heavy chest girdles (Kavacha), and distinctive black-and-gold facial motifs.',
    instruments:
      'Chande (high-pitched barrel drum), Maddale (resonant double-headed drum), and Taala (bronze cymbals played by the Bhagavata).',
    traditions:
      'All-night performances known as Bayalata, where the troupe (Mela) travels from village to village throughout the auspicious winter and summer seasons.',
    bannerUrl:
      'https://images.unsplash.com/photo-1609137144820-2b7e5e3477d9?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80',
    accentColor: '#d97736',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-bharatanatyam',
    slug: 'bharatanatyam',
    name: 'Bharatanatyam',
    canonicalName: 'Bharatanatyam (பரதநாட்டியம்)',
    category: 'Classical Dance',
    region: 'Tamil Nadu, South India',
    overview:
      'Bharatanatyam is the oldest classical dance tradition of India, renowned for its sculptured geometric lines (Aramandi), crisp footwork, and deep spiritual storytelling.',
    history:
      'Originating over two millennia ago in the grand granite temples of Tamil Nadu as Sadir Attam performed by Devadasis, and formalized by the Thanjavur Quartet in the 19th century based on Sage Bharata Muni\'s Natya Shastra.',
    significance:
      'Considered a visual yoga (Natya Yoga) where the human body becomes a vessel of sacred geometry celebrating cosmic creation and divine devotion (Bhakti).',
    performanceStyle:
      'Structured into Nritta (pure rhythmic geometric movement), Nritya (expressive storytelling through song and gesture), and Natya (dramatic enactment), transitioning through Alarippu, Jatiswaram, Varnam, Padam, and Tillana.',
    costumes:
      'Pleated Kanchipuram silk saris with pleated front fans that open like a peacock during deep knee bends, temple jewelry (Salangai / Ghungroo bells, head ornaments representing sun and moon), and red alta dye on palms and feet.',
    instruments:
      'Mridangam (primary percussion), Nattuvangam (brass cymbals played by the guru conductor), Carnatic violin, Veena, and Flute.',
    traditions:
      'Arangetram (maiden stage ascent ceremony after rigorous guru-shishya parampara apprenticeship), traditional Margam concert repertoire.',
    bannerUrl:
      'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    accentColor: '#b83280',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-carnatic-music',
    slug: 'carnatic-music',
    name: 'Carnatic Music',
    canonicalName: 'Karnāṭaka Saṃgīta (ಕರ್ನಾಟಕ ಸಂಗೀತ)',
    category: 'Classical Music',
    region: 'Southern India (Karnataka, Tamil Nadu, Andhra, Kerala)',
    overview:
      'Carnatic music is a sophisticated classical melodic system emphasizing intricate raga improvisation, complex rhythmic talas, and devotional poetry in Sanskrit, Telugu, Kannada, and Tamil.',
    history:
      'Codified by Purandara Dasa (known as the Pitamaha or grandfather of Carnatic music) and elevated during the Golden Age by the Musical Trinity: Tyagaraja, Muthuswami Dikshitar, and Syama Sastri.',
    significance:
      'An elevated intellectual and contemplative art based on Nada Brahma (sound as ultimate reality), weaving microtonal nuances (Gamakas) across 72 parent Melakarta ragas.',
    performanceStyle:
      'Concerts (Kutcheri) transition through Varnam, Kriti renditions, elaborate Alapana (unmetered melodic exploration), Neraval, Kalpanaswaram, and culminating in Ragam-Tanam-Pallavi followed by a Thani Avarthanam percussion duel.',
    costumes:
      'Traditional South Indian Veshti and Angavastram for men; exquisite silk saris with auspicious gold borders for women.',
    instruments:
      'Saraswati Veena, Venu (bamboo flute), Carnatic Violin, Mridangam, Ghatam (clay pot), Kanjira (frame drum), and Morsing (jaw harp).',
    traditions:
      'Margazhi Chennai December Season, Tyagaraja Aradhana in Thiruvaiyaru, Sabha culture fostering guru-disciple lineages.',
    bannerUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    accentColor: '#c98d48',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-kuchipudi',
    slug: 'kuchipudi',
    name: 'Kuchipudi',
    canonicalName: 'Kuchipudi (కూచిపూడి)',
    category: 'Classical Dance',
    region: 'Andhra Pradesh, South India',
    overview:
      'Kuchipudi is a classical dance-drama known for its lyrical grace, brisk rhythmic footwork, expressive theatrical abhinaya, and the iconic Tarangam danced upon the rim of a brass plate.',
    history:
      'Originated in the village of Kuchelapuram in Andhra Pradesh by the 17th-century saint Siddhendra Yogi, initially cultivated by Brahmin male troupes as sacred Yakshagana dance-dramas.',
    significance:
      'Celebrates divine playful leelas and profound romantic devotion, embodying both Lasya (gentle, graceful energy) and Tandava (vigorous rhythm).',
    performanceStyle:
      'Blends solo dance with spoken dialogue and singing by the dancers themselves. Highlights include balancing a pot of water on the head while dancing rhythmically on a brass plate rim (Tarangam).',
    costumes:
      'Lightweight silk costumes with fan-like pleats, elaborate braid jewelry (Choti / Jada), fragrant jasmine flowers, and auspicious temple ornaments.',
    instruments:
      'Mridangam, Nattuvangam, Violin, Flute, and Tambura.',
    traditions:
      'Bhamakalapam (the supreme signature dance drama of Satyabhama and Krishna), Kuchipudi village sacred natya festivals.',
    bannerUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    accentColor: '#e11d48',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-hindustani-classical',
    slug: 'hindustani-classical',
    name: 'Hindustani Classical Music',
    canonicalName: 'Hindustānī Shāstrīya Saṅgīt (हिंदुस्तानी शास्त्रीय संगीत)',
    category: 'Classical Music',
    region: 'Northern & Western India',
    overview:
      'The classical music tradition of Northern India, characterized by extensive modal improvisation within ragas, poetic bandishes, and diverse gharana lineages.',
    history:
      'Synthesized from ancient Vedic chanting, Sanskrit musical treatises, and medieval Persian/Central Asian musical dialogues during the Sultanate and Mughal eras, nurtured by masters such as Amir Khusrau and Miyan Tansen.',
    significance:
      'Conceived as a spiritual sadhana aligned with the time cycles of day and seasons (Prahar concept), evoking specific rasas from serene dawn to contemplative midnight.',
    performanceStyle:
      'Vocal styles include Dhrupad, Khayal, and Thumri; instrumental styles follow the Vilambit (slow contemplative) to Drut (fast virtuoso) arc, climaxing in exhilarating Jhala.',
    costumes:
      'Elegant traditional Kurtas, Angarkhas, and Sherwanis; fine Banarasi and Chanderi sarees for vocalists.',
    instruments:
      'Sitar, Sarod, Santoor, Bansuri, Shehnai, Sarangi, accompanied by the Tabla and Tanpura drone.',
    traditions:
      'Gharana system (Gwalior, Kirana, Agra, Maihar, Patiala, Senia), Guru-Shishya parampara, all-night music festivals (Tansen Samaroh, Sawai Gandharva).',
    bannerUrl:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    accentColor: '#4f46e5',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-odissi',
    slug: 'odissi',
    name: 'Odissi',
    canonicalName: 'Oḍiśī (ଓଡ଼ିଶୀ)',
    category: 'Classical Dance',
    region: 'Odisha, Eastern India',
    overview:
      'Odissi is an ancient classical dance of breathtaking sculptural beauty, evoking the dancing figures etched on the sun temple of Konark through its signature Tribhanga and Chauka postures.',
    history:
      'Evidenced in the 2nd-century BCE rock carvings of Udayagiri, practiced for centuries by Maharis (temple dancer-priestesses of Lord Jagannath) and Gotipuas (young acrobatic boy dancers).',
    significance:
      'An ecstatic devotional expression dedicated to Jagannath (Lord of the Universe), immortalizing verses from Jayadeva\'s 12th-century lyrical masterpiece Gita Govinda.',
    performanceStyle:
      'Distinguished by two primary stances: Chauka (a square, grounded masculine stance) and Tribhanga (a lyrical, feminine three-bend posture at neck, torso, and knee) reflecting classical sculpture.',
    costumes:
      'Sambalpuri or Bomkai handloom silk sarees draped with distinctive pleats, authentic Cuttack silver filigree (Tarakasi) jewelry, and the towering white Tahia flower crown.',
    instruments:
      'Mardala (primary barrel drum of Odisha), Odissi Flute, Sitar, Violin, and Manjira.',
    traditions:
      'Konark Dance Festival, Jagannath Puri Chandan Yatra, Guru Kelucharan Mohapatra parampara.',
    bannerUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    accentColor: '#059669',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-kalaripayattu',
    slug: 'kalaripayattu',
    name: 'Kalaripayattu',
    canonicalName: 'Kalaripayattu (കളരിപ്പയറ്റ്)',
    category: 'Martial Art',
    region: 'Kerala, South India',
    overview:
      'Considered one of the oldest fighting arts in existence, Kalaripayattu synthesizes physical combat postures derived from animal instincts, yogic flexibility, medicinal marma therapy, and spiritual discipline.',
    history:
      'Codified in ancient Sangam literature and attributed to Sage Parasurama and Agastya, practiced in earthen training pits called Kalaris under the supervision of a Gurukkal.',
    significance:
      'Beyond martial prowess, it is a holistic science integrating Ayurveda, Marma Shastra (vital energy points), and meditation.',
    performanceStyle:
      'Includes Meipayattu (body conditioning routines), Kolthari (wooden weapons like sticks and curved staff), Angathari (metal weapons: Urumi flexible sword, dagger, shield), and Verumkai (barehanded defense).',
    costumes:
      'Traditional Kachakkettu (firm waist wrap and loincloth) allowing extreme flexibility and acrobatics, with herbal sesame oil applied to the body.',
    instruments:
      'Rhythmic counts (Vaythari) chanted dynamically by the Gurukkal accompanied by Chenda drumming during public demonstration tournaments.',
    traditions:
      'Worship of the Poothara (seven-stepped sacred altar in the south-west corner of the Kalari), Kalari Chikitsa healing sessions.',
    bannerUrl:
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    accentColor: '#b45309',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'culture-madhubani-art',
    slug: 'madhubani-art',
    name: 'Madhubani & Mithila Painting',
    canonicalName: 'Mithila Kala (मिथिला चित्रकला)',
    category: 'Traditional Art & Craft',
    region: 'Mithila region, Bihar, Eastern India',
    overview:
      'An ancient folk art form characterized by line drawings filled with vibrant mineral and vegetable dyes, intricate double-line borders, and symbolic motifs of nature, deities, and wedding rituals.',
    history:
      'Legend dates Mithila painting to the Ramayana, when King Janaka commissioned artists to paint his daughter Sita’s marriage to Lord Rama. Passed down through generations of women on freshly mud-plastered hut walls (Bhitti Chitra).',
    significance:
      'Ritual expression that blesses the home with fertility, harmony, and cosmic protection (Kohbar ghar paintings).',
    performanceStyle:
      'Five distinct styles: Bharni, Katchni, Tantrik, Godna, and Kohbar. No white space is left untouched; margins are filled with leaves, birds, fish, and suns.',
    costumes:
      'Traditionally painted in comfortable handloom cotton sarees and dhotis, often using natural indigo, turmeric, and vermilion.',
    instruments:
      'Bamboo twigs wrapped with raw cotton, nib pens, matchsticks, and fingers; natural dyes sourced from marigolds, soot, turmeric, and indigo.',
    traditions:
      'Kohbar painting for newlyweds, Madhubani village artisan cooperatives recognized with UNESCO and Geographical Indication (GI) status.',
    bannerUrl:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
    imagePlate:
      'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=800&q=80',
    accentColor: '#9333ea',
    createdAt: new Date().toISOString(),
  },
];
