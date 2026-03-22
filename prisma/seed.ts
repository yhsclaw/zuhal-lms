import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const chapters = [
  { number: 1, title: "Basic Grip & Posture", description: "Proper stick grip (matched grip), seating position, and pedal placement." },
  { number: 2, title: "Quarter Notes", description: "Playing steady quarter notes on snare, hi-hat, and bass drum." },
  { number: 3, title: "Eighth Notes", description: "Eighth note patterns on hi-hat with snare and bass drum." },
  { number: 4, title: "Basic Rock Beat", description: "Standard 4/4 rock pattern: hi-hat eighths, snare on 2 & 4, bass on 1 & 3." },
  { number: 5, title: "Bass Drum Variations", description: "Adding bass drum on the 'and' of beats within the rock pattern." },
  { number: 6, title: "Hi-Hat Opening", description: "Open hi-hat technique and incorporating open/close patterns." },
  { number: 7, title: "Quarter Note Fills", description: "Basic fills using quarter notes around the toms." },
  { number: 8, title: "Eighth Note Fills", description: "Fills using eighth notes moving around the drum kit." },
  { number: 9, title: "Crash Cymbal Technique", description: "Crash cymbal hits on beat 1 after fills, proper stroke technique." },
  { number: 10, title: "Sixteenth Notes – Single Strokes", description: "Single stroke roll (RLRL) at sixteenth note speed." },
  { number: 11, title: "Sixteenth Notes – Double Strokes", description: "Double stroke roll (RRLL) at various tempos." },
  { number: 12, title: "Sixteenth Note Hi-Hat Patterns", description: "Sixteenth notes on hi-hat with snare and bass drum." },
  { number: 13, title: "Syncopated Bass Drum", description: "Off-beat bass drum patterns creating syncopation." },
  { number: 14, title: "Accent Patterns", description: "Accented and unaccented strokes on snare and hi-hat." },
  { number: 15, title: "Flams", description: "Flam rudiment: grace note technique on snare drum." },
  { number: 16, title: "Drags", description: "Drag rudiment: double grace notes applied to beats and fills." },
  { number: 17, title: "Paradiddles", description: "Single paradiddle (RLRR LRLL) applied to kit." },
  { number: 18, title: "Ride Cymbal Patterns", description: "Transitioning from hi-hat to ride cymbal, bell patterns." },
  { number: 19, title: "Tom Grooves", description: "Grooves incorporating floor tom and rack toms." },
  { number: 20, title: "Sixteenth Note Fills – Advanced", description: "Complex sixteenth note fills across all drums." },
  { number: 21, title: "Half-Time Feel", description: "Half-time grooves: snare on beat 3, creating a slower feel." },
  { number: 22, title: "Shuffle Feel", description: "Triplet-based shuffle pattern on hi-hat." },
  { number: 23, title: "Triplets", description: "Triplet subdivisions on snare and around the kit." },
  { number: 24, title: "12/8 Feel", description: "12/8 time signature grooves, blues and ballad patterns." },
  { number: 25, title: "Ghost Notes", description: "Soft snare ghost notes between backbeats for groove depth." },
  { number: 26, title: "Linear Patterns", description: "Patterns where no two limbs play at the same time." },
  { number: 27, title: "Cross-Stick Technique", description: "Rim click / cross-stick for softer dynamics and ballads." },
  { number: 28, title: "Dynamics & Musical Expression", description: "Playing at different volume levels (pp to ff), crescendos." },
  { number: 29, title: "Odd Time – 3/4 Waltz", description: "Grooves and fills in 3/4 time signature." },
  { number: 30, title: "Odd Time – 5/4", description: "Grooves and fills in 5/4 time, counting strategies." },
  { number: 31, title: "Odd Time – 7/8", description: "7/8 time signature patterns and subdivisions." },
  { number: 32, title: "Double Bass Basics", description: "Introduction to double bass pedal or hi-hat foot patterns." },
  { number: 33, title: "Moeller Technique", description: "Whip stroke, tap stroke, and full stroke for speed and endurance." },
  { number: 34, title: "Buzz Roll", description: "Multiple bounce roll (buzz roll) for sustained sound." },
  { number: 35, title: "Funk Grooves", description: "Syncopated funk patterns with ghost notes and accents." },
  { number: 36, title: "Latin – Bossa Nova", description: "Bossa nova pattern: cross-stick, bass drum, hi-hat foot." },
  { number: 37, title: "Latin – Samba", description: "Samba groove with bass drum pattern and hi-hat." },
  { number: 38, title: "Jazz – Swing Pattern", description: "Ride cymbal swing pattern, hi-hat on 2 & 4, comping." },
  { number: 39, title: "Jazz – Brushes", description: "Brush technique: sweeping and tapping patterns." },
  { number: 40, title: "Jazz – Comping", description: "Snare and bass drum comping underneath swing ride." },
  { number: 41, title: "Song Structure & Arrangement", description: "Navigating verse, chorus, bridge with appropriate parts." },
  { number: 42, title: "Reading Drum Notation", description: "Standard drum notation reading exercises." },
  { number: 43, title: "Chart Reading & Form", description: "Reading lead sheets and drum charts, following road maps." },
  { number: 44, title: "Metric Modulation", description: "Transitioning between tempos using shared subdivisions." },
  { number: 45, title: "Polyrhythms – 3 over 2", description: "Playing 3 against 2 between hands and feet." },
  { number: 46, title: "Polyrhythms – 4 over 3", description: "Playing 4 against 3, advanced independence exercises." },
  { number: 47, title: "Advanced Independence", description: "Four-way coordination exercises for all limbs." },
  { number: 48, title: "Speed & Endurance", description: "Building speed with singles, doubles, and paradiddles." },
  { number: 49, title: "Advanced Fills & Solo Concepts", description: "Extended fills, solo construction, and phrasing." },
  { number: 50, title: "Playing with Tracks & Click", description: "Playing along to backing tracks and metronome exercises." },
  { number: 51, title: "Studio & Live Performance", description: "Recording techniques, live sound, stage presence." },
  { number: 52, title: "Musicality & Personal Style", description: "Developing personal voice, listening skills, and musical taste." },
];

const songNotations = [
  {
    title: "We Will Rock You - Queen",
    difficulty: "BEGINNER" as const,
    notation: `// We Will Rock You - Queen
// Tempo: 81 BPM | 4/4
// Seviye: Başlangıç

// BD = Bass Drum, SD = Snare, HH = Hi-Hat
// x = vuruş, - = sus, o = açık hi-hat

// Ana Ritim (tekrarlayan pattern)
//         1   &   2   &   3   &   4   &
// SD  |   -   -   -   -   x   -   -   -   |
// BD  |   x   -   x   -   -   -   -   -   |

// Koro (cymbal eklenir)
//         1   &   2   &   3   &   4   &
// CR  |   x   -   -   -   -   -   -   -   |
// SD  |   -   -   -   -   x   -   -   -   |
// BD  |   x   -   x   -   -   -   -   -   |

// Not: Stomp-stomp-clap pattern'i
// Ayak-Ayak-El şeklinde çalınır
`,
  },
  {
    title: "Billie Jean - Michael Jackson",
    difficulty: "BEGINNER" as const,
    notation: `// Billie Jean - Michael Jackson
// Tempo: 117 BPM | 4/4
// Seviye: Başlangıç

// HH = Hi-Hat, SD = Snare, BD = Bass Drum
// x = vuruş, - = sus

// Ana Groove
//         1 e & a 2 e & a 3 e & a 4 e & a
// HH  |   x - x - x - x - x - x - x - x - |
// SD  |   - - - - x - - - - - - - x - - - |
// BD  |   x - - - - - - - x - - - - - - - |

// Koro
//         1 e & a 2 e & a 3 e & a 4 e & a
// HH  |   x - x - x - x - x - x - x - x - |
// SD  |   - - - - x - - - - - - - x - - - |
// BD  |   x - - - - - x - x - - - - - - - |
`,
  },
  {
    title: "Back in Black - AC/DC",
    difficulty: "BEGINNER" as const,
    notation: `// Back in Black - AC/DC
// Tempo: 94 BPM | 4/4
// Seviye: Başlangıç

// HH = Hi-Hat, SD = Snare, BD = Bass Drum
// x = vuruş, o = açık hi-hat, - = sus

// İntro (hi-hat count)
//         1   &   2   &   3   &   4   &
// HH  |   x   -   x   -   x   -   x   -   |

// Ana Beat
//         1   &   2   &   3   &   4   &
// HH  |   x   -   x   -   x   -   x   -   |
// SD  |   -   -   -   -   x   -   -   -   |
// BD  |   x   -   -   -   -   -   x   -   |

// Koro
//         1   &   2   &   3   &   4   &
// CR  |   x   -   -   -   -   -   -   -   |
// HH  |   -   -   x   -   x   -   x   -   |
// SD  |   -   -   -   -   x   -   -   -   |
// BD  |   x   -   -   -   -   -   x   x   |
`,
  },
  {
    title: "Tom Sawyer - Rush",
    difficulty: "ADVANCED" as const,
    notation: `// Tom Sawyer - Rush
// Tempo: 88 BPM | 7/8 → 4/4 değişimli
// Seviye: İleri

// HH = Hi-Hat, SD = Snare, BD = Bass Drum
// RD = Ride, CR = Crash, T1 = Tom 1, T2 = Tom 2, FT = Floor Tom
// x = vuruş, o = açık, g = ghost note, - = sus

// İntro (7/8)
//         1 e & a 2 e & a 3 e &
// RD  |   x - x - x - x - x - x - x - |
// SD  |   - - - - x - - - - - g - x - |
// BD  |   x - - - - - x - - - - - - - |

// Ana Groove (4/4)
//         1 e & a 2 e & a 3 e & a 4 e & a
// HH  |   x - x - x - x - x - x - x - x - |
// SD  |   - - - - x - - g - - g - x - - - |
// BD  |   x - - x - - x - - - x - - - x - |

// Fill 1
//         1 e & a 2 e & a 3 e & a 4 e & a
// T1  |   x - x - - - - - - - - - - - - - |
// T2  |   - - - - x - x - - - - - - - - - |
// FT  |   - - - - - - - - x - x - x x x x |
// BD  |   x - - - - - - - - - - - - - - - |
`,
  },
  {
    title: "Toxicity - System of a Down",
    difficulty: "ADVANCED" as const,
    notation: `// Toxicity - System of a Down
// Tempo: 78/164 BPM (yarı zaman / tam zaman) | 4/4
// Seviye: İleri

// HH = Hi-Hat, SD = Snare, BD = Bass Drum, CH = China
// x = vuruş, o = açık, g = ghost note, - = sus

// İntro Pattern
//         1 e & a 2 e & a 3 e & a 4 e & a
// HH  |   x - x - x - x - x - x - x - x - |
// SD  |   - - - - x - - - - - - - x - - - |
// BD  |   x - x - - - - - x - - - - - x - |

// Koro (hızlı bölüm - double time)
//         1 e & a 2 e & a 3 e & a 4 e & a
// CH  |   x - x - x - x - x - x - x - x - |
// SD  |   - - - - x - - - - - - - x - - - |
// BD  |   x x - x - - x - x x - x - - x - |

// Köprü (6/8 hissi)
//         1   2   3   4   5   6
// RD  |   x   -   x   x   -   x   |
// SD  |   -   -   x   -   -   x   |
// BD  |   x   -   -   x   -   -   |
`,
  },
];

async function main() {
  console.log("Seeding D52 chapters...");

  for (const chapter of chapters) {
    await prisma.chapter.upsert({
      where: { number: chapter.number },
      update: { title: chapter.title, description: chapter.description },
      create: chapter,
    });
  }

  console.log(`Seeded ${chapters.length} chapters.`);

  console.log("Seeding song notations...");

  for (const song of songNotations) {
    const existing = await prisma.songNotation.findFirst({
      where: { title: song.title },
    });
    if (!existing) {
      await prisma.songNotation.create({ data: song });
    }
  }

  console.log(`Seeded ${songNotations.length} song notations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
