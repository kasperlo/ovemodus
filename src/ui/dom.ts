function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Fant ikke #${id} i index.html`);
  return el as T;
}

export const els = {
  segSection: byId('segSection'), segMode: byId('segMode'),
  btnMic: byId<HTMLButtonElement>('btnMic'), btnMidi: byId<HTMLButtonElement>('btnMidi'),
  meterFill: byId('meterFill'), meterGate: byId('meterGate'), inputStatus: byId('inputStatus'),
  optSens: byId<HTMLSelectElement>('optSens'), optOct: byId<HTMLInputElement>('optOct'),
  optLH: byId<HTMLInputElement>('optLH'), optAcc: byId<HTMLInputElement>('optAcc'),
  tempo: byId<HTMLInputElement>('tempo'), tempoOut: byId<HTMLOutputElement>('tempoOut'),
  btnGo: byId<HTMLButtonElement>('btnGo'), btnDemo: byId<HTMLButtonElement>('btnDemo'), btnReset: byId<HTMLButtonElement>('btnReset'),
  clue: byId('clue'), clueLabel: byId('clueLabel'), clueBig: byId('clueBig'), clueSub: byId('clueSub'), clueThen: byId('clueThen'), clueActions: byId('clueActions'),
  k1: byId('k1'), k2: byId('k2'), k3: byId('k3'), k4: byId('k4'), v1: byId('v1'), v2: byId('v2'), v3: byId('v3'), v4: byId('v4'),
  progFill: byId('progFill'), hint: byId('hint'), strip: byId('strip'), kbd: byId('kbd'), heard: byId('heard'),
  pillMic: byId('pillMic'), pillMidi: byId('pillMidi'),
  diag: byId<HTMLDialogElement>('diag'), btnDiag: byId<HTMLButtonElement>('btnDiag'), diagSettings: byId('diagSettings'),
  diagLive: byId('diagLive'), diagStep: byId('diagStep'), btnCal: byId<HTMLButtonElement>('btnCal'), diagResult: byId('diagResult'),
  btnCopy: byId<HTMLButtonElement>('btnCopy'), diagCopied: byId('diagCopied'),
  updateBar: byId('updateBar'), btnUpdate: byId<HTMLButtonElement>('btnUpdate'),
  panel: byId('panel'), btnSetup: byId<HTMLButtonElement>('btnSetup'), setupSum: byId('setupSum'),
  fileImport: byId<HTMLInputElement>('fileImport'), btnDeleteSong: byId<HTMLButtonElement>('btnDeleteSong'), importStatus: byId('importStatus'),
  selSong: byId<HTMLSelectElement>('selSong'), segHand: byId('segHand'), secUse: byId('secUse'), secCasio: byId('secCasio'),
  casioTable: byId<HTMLTableElement>('casioTable'), sfxKeys: byId('sfxKeys'),
  songTitle: byId('songTitle'), subText: byId('subText'),
  optLHText: byId('optLHText'), optAccText: byId('optAccText'), optLHStaffText: byId('optLHStaffText'),
  segView: byId('segView'), sheet: byId('sheet'), optLHStaff: byId<HTMLInputElement>('optLHStaff'), optLHStaffLabel: byId('optLHStaffLabel')
};

/** Knappene i en knappegruppe (`.seg`). */
export const segButtons = (seg: HTMLElement): HTMLElement[] => Array.from(seg.children) as HTMLElement[];
