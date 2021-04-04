export const TONE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export type Tone = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export const enum Chords {
	NONE = 'NONE',
	A = 'A',
	Am = 'Am',
	Bm = 'Bm',
	C = 'C',
	D = 'D',
	Dm = 'Dm',
	E = 'E',
	Em = 'Em',
	F = 'F',
	G = 'G'
}

export const ChordValues: {[name: string]: number[]} = {
	// [Chords.A]: ['C#', 'E', 'A'],
	[Chords.Am]: [1.1, 0, 0, 0, 1.1, 0, 0, -0.3, 0, 1.1, 0, 0], // 'C', 'E', 'A'
	// [Chords.Bm]: ['D', 'F#', 'B'],
	[Chords.C ]: [1.1, 0, 0, 0, 1.1, 0, 0, 1.2, 0, -0.3, 0, 0], // 'C', 'E', 'G'
	[Chords.D ]: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0], // 'D', 'F#', 'A'
	// [Chords.Dm]: ['D', 'F', 'A'],
	[Chords.E ]: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], // 'E', 'G#', 'B'
	// [Chords.Em]: ['E', 'G', 'B'],
	[Chords.F ]: [0.9, 0, 0, 0, 0, 1.1, 0, 0, 0, 0.9, 0, 0], // 'C', 'F', 'A'
	// [Chords.G]: ['D', 'G', 'B'],
}