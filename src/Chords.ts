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

export const ChordValues: {[name: string]: Array<Tone>} = {
	[Chords.A]: ['C#', 'E', 'A'],
	[Chords.Am]: ['C', 'E', 'A'],
	[Chords.Bm]: ['D', 'F#', 'B'],
	[Chords.C]: ['C', 'E', 'G'],
	[Chords.D]: ['D', 'F#', 'A'],
	[Chords.Dm]: ['D', 'F', 'A'],
	[Chords.E]: ['E', 'G#', 'B'],
	[Chords.Em]: ['E', 'G', 'B'],
	[Chords.F]: ['C', 'F', 'A'],
	[Chords.G]: ['D', 'G', 'B'],
}