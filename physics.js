// Physics(ネオンのときだけ): IBDP Physics HL の最初のページ。背景はWebGPU(白黒のゴシックの大聖堂+浮かぶ惑星)で、ずっと動いている。
import { createGpuView } from './gpu-view.js?v=77';
import { WGSL } from './physics-bg.js?v=77';
import { TOPICS as TOPICS5, FIGS as FIGS5 } from './physics-a5.js?v=77';
import { TOPICS1, FIGS1 } from './physics-a1.js?v=77';
import { TOPICS2, FIGS2 } from './physics-a2.js?v=77';
import { TOPICS3, FIGS3 } from './physics-a3.js?v=77';
const TOPICS = { ...TOPICS1, ...TOPICS2, ...TOPICS3, ...TOPICS5 };
const FIGS = { ...FIGS5, ...FIGS1, ...FIGS2, ...FIGS3 };

let punch = -10;           // 最後にページを切り替えた時刻(秒)。背景の演出に使う
const host = document.getElementById('physics-view');
const stage = document.getElementById('ph-stage');
const toast = document.getElementById('ph-toast');

const ICONS = {
  book: '<path d="M12 6.5C9.8 5 6.5 4.5 3 5v13c3.5-.5 6.8 0 9 1.5 2.2-1.5 5.5-2 9-1.5V5c-3.5-.5-6.8 0-9 1.5zM12 6.5v13"/>',
  pencil: '<path d="M4 20l1-4L16.500 4.500a2 2 0 0 1 3 3L8 19zM14.500 6.500l3 3"/><path d="M3 5l2-2 4 4-2 2zM15 17l2 2 2-2-2-2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  chart: '<path d="M4 20V13M10 20V9M16 20v-5M22 20V6"/><path d="M3 20h19M15 4h5v5M20 4l-6 6-3-3-5 5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  star: '<path d="M12 1.500l2.200 8.300 8.300 2.200-8.300 2.200L12 22.500l-2.200-8.300L1.500 12l8.300-2.200z"/>',
};
const ic = (n, cls = '') => `<svg class="ph-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

const CARDS = [
  ['book', 'Topics', 'Study by unit and subtopic'],
  ['pencil', 'Practice', 'Test your understanding'],
  ['layers', 'Resources', 'Notes, formulas, and more'],
  ['chart', 'Progress', 'Track your performance'],
];

const AREAS = [
  { id: 'A', title: 'Space, time and motion', icon: 'motion', subs: [['A.1', 'Kinematics'], ['A.2', 'Forces and momentum'], ['A.3', 'Work, energy and power'], ['A.4', 'Rigid body mechanics'], ['A.5', 'Galilean and special relativity']] },
  { id: 'B', title: 'The particulate nature of matter', icon: 'thermo', subs: [['B.1', 'Thermal energy transfers'], ['B.2', 'Greenhouse effect'], ['B.3', 'Gas laws'], ['B.4', 'Thermodynamics'], ['B.5', 'Current and circuits']] },
  { id: 'C', title: 'Wave behaviour', icon: 'wave', subs: [['C.1', 'Simple harmonic motion'], ['C.2', 'Wave model'], ['C.3', 'Wave phenomena'], ['C.4', 'Standing waves and resonance'], ['C.5', 'Doppler effect']] },
  { id: 'D', title: 'Fields', icon: 'magnet', subs: [['D.1', 'Gravitational fields'], ['D.2', 'Electric and magnetic fields'], ['D.3', 'Motion in electromagnetic fields'], ['D.4', 'Induction']] },
  { id: 'E', title: 'Nuclear and quantum physics', icon: 'atom', subs: [['E.1', 'Structure of the atom'], ['E.2', 'Quantum physics'], ['E.3', 'Radioactive decay'], ['E.4', 'Fission'], ['E.5', 'Fusion and stars']] },
];
// 領域ごとの説明(A は画面の見本どおり。B〜E は、IBの内容に沿って書いた説明で、あとで差し替えられる)
const INFO = {
  A: { sub: 'Study the motion of objects and the nature of space and time.', icon: 'planet', rows: [
    ['graph', 'Describing motion using equations, graphs and models.'], ['block', 'Forces, Newton\'s laws and conservation of momentum.'], ['bolt', 'Work, energy transfers, efficiency and power.'],
    ['cube', 'Rotation, torque, angular motion and equilibrium.'], ['well', 'Inertial frames, the speed of light and relativistic effects.']] },
  B: { sub: 'Study matter, thermal energy, gases and electric circuits.', icon: 'thermo', rows: [
    ['thermo', 'Heat, temperature, conduction, convection and radiation.'], ['sun', 'Radiation, the Earth\'s energy balance and climate.'], ['gas', 'Pressure, volume, temperature and the ideal gas.'],
    ['cycle', 'The laws of thermodynamics, entropy and heat engines.'], ['circuit', 'Charge, current, resistance and circuit analysis.']] },
  C: { sub: 'Study oscillations and the behaviour of waves.', icon: 'wave', rows: [
    ['spring', 'Oscillations, restoring forces and energy in simple harmonic motion.'], ['wave', 'Describing travelling waves and their properties.'], ['ripple', 'Reflection, refraction, diffraction, interference and polarization.'],
    ['standing', 'Standing waves, harmonics and resonance.'], ['doppler', 'Frequency changes from moving sources and observers.']] },
  D: { sub: 'Study gravitational, electric and magnetic fields.', icon: 'magnet', rows: [
    ['planet', 'Newton\'s law of gravitation, field strength and potential.'], ['charge', 'Coulomb\'s law, electric and magnetic fields and potential.'],
    ['particle', 'Charged particles moving in electric and magnetic fields.'], ['coil', 'Electromagnetic induction, Faraday\'s law and Lenz\'s law.']] },
  E: { sub: 'Study the atom, quantum behaviour and the nucleus.', icon: 'atom', rows: [
    ['atom', 'Atomic models, spectra and the energy levels of atoms.'], ['photon', 'Photons, the photoelectric effect and matter waves.'], ['decay', 'Nuclear stability, decay modes and half-life.'],
    ['split', 'Nuclear fission and energy generation.'], ['star', 'Nuclear fusion, the Sun and stellar evolution.']] },
};
Object.assign(ICONS, {
  motion: '<circle cx="8" cy="12" r="4"/><path d="M14 12h8M19 9l3 3-3 3M2 18h9"/>',
  thermo: '<path d="M10 4a2 2 0 0 1 4 0v9.500a4 4 0 1 1-4 0z"/><path d="M12 8v8"/><circle cx="12" cy="17" r="1.500"/><path d="M17 5h3M17 8h2M17 11h3"/>',
  wave: '<path d="M2 12c2-8 4-8 5 0s3 8 5 0 3-8 5 0 3 8 5 0"/><path d="M2 12h20" stroke-dasharray="1 3"/>',
  magnet: '<path d="M6 3v9a6 6 0 0 0 12 0V3h-4v9a2 2 0 0 1-4 0V3z"/><path d="M6 7h4M14 7h4"/><path d="M19 2l1-1M21 5h2M18 1v2"/>',
  atom: '<circle cx="12" cy="12" r="1.800"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
});

// サブトピック(A1〜A5 など)の中身。いまは A5 だけ。ほかは、内容が決まったら追加する
const SUBS = {
  A1: { area: 'A', title: 'Kinematics', icon: 'graph', sub: 'Describing motion using equations, graphs and models.', rows: [
    ['disp', 'Displacement, distance, speed and velocity', 'Position, path length, and how fast and in which direction an object moves.'],
    ['accel', 'Uniformly accelerated motion: the equations of kinematics', 'The equations that link displacement, velocity, acceleration and time.'],
    ['linegraph', 'Graphs of motion', 'Reading displacement\u2013time, velocity\u2013time and acceleration\u2013time graphs.'],
    ['projectile', 'Projectile motion', 'Motion under gravity in two dimensions.']] },
  A2: { area: 'A', title: 'Forces and momentum', icon: 'block', sub: 'Forces, Newton\'s laws and conservation of momentum.', rows: [
    ['forces', 'Forces and their direction', 'Types of force, free-body diagrams and resultant force.'],
    ['newton', 'Newton\u2019s laws of motion', 'Inertia, F = ma and action\u2013reaction pairs.'],
    ['circular', 'Circular motion', 'Centripetal acceleration and the force that keeps an object on a circular path.']] },
  A3: { area: 'A', title: 'Work, energy and power', icon: 'bolt', sub: 'Work, energy transfers, efficiency and power.', rows: [
    ['work', 'Work', 'Force acting through a distance, and the energy it transfers.'],
    ['conserve', 'Conservation of energy', 'Energy changes form but the total stays the same.'],
    ['power', 'Power and efficiency', 'The rate of energy transfer and how much of it is useful.'],
    ['transfer', 'Energy transfers', 'Following energy through mechanical systems.']] },
  A4: { area: 'A', title: 'Rigid body mechanics', icon: 'cube', sub: 'Rotation, torque, angular motion and equilibrium.', rows: [
    ['momentum', 'Newton\u2019s second law in terms of momentum', 'Force as the rate of change of momentum.'],
    ['impulse', 'Impulse and force\u2013time graphs', 'Change in momentum from a force acting over time.'],
    ['collide', 'Conservation of momentum', 'Total momentum of an isolated system stays constant.'],
    ['ke', 'Kinetic energy and momentum', 'Comparing the two, and elastic and inelastic collisions.'],
    ['twod', 'Two-dimensional collisions', 'Collisions analysed with momentum components.']] },
  B1: { area: 'B', title: 'Thermal energy transfers', icon: 'thermo', sub: 'Heat, temperature, conduction, convection and radiation.', rows: [
    ['particles', 'Particles, temperature and energy', 'How the motion of particles relates to temperature and internal energy.'],
    ['phase', 'Specific heat capacity and change of phase', 'Energy needed to change temperature, and to melt or boil a substance.'],
    ['heatflow', 'Thermal energy transfer', 'Conduction, convection and radiation.']] },
  B2: { area: 'B', title: 'Greenhouse effect', icon: 'sun', sub: 'Radiation, the Earth\'s energy balance and climate.', rows: [
    ['blackbody', 'Radiation from real bodies', 'Emission from real surfaces: emissivity, power and the Stefan\u2013Boltzmann law.'],
    ['earth', 'Energy balance of the earth', 'Incoming and outgoing radiation, albedo and the greenhouse effect.']] },
  B3: { area: 'B', title: 'Gas laws', icon: 'gas', sub: 'Pressure, volume, temperature and the ideal gas.', rows: [
    ['mole', 'Moles, molar mass and the Avogadro constant', 'Counting particles and relating amount, mass and number.'],
    ['gas', 'Ideal gases', 'Pressure, volume and temperature relations of an ideal gas.'],
    ['boltz', 'The Boltzmann equation', 'Connecting particle motion to temperature and pressure.']] },
  B4: { area: 'B', title: 'Thermodynamics', icon: 'cycle', sub: 'The laws of thermodynamics, entropy and heat engines.', rows: [
    ['internal', 'Internal energy', 'The total energy of the particles in a system.'],
    ['law1', 'The first law of thermodynamics', 'Energy conservation for heat, work and internal energy.'],
    ['law2', 'The second law of thermodynamics', 'Entropy and the direction of natural processes.'],
    ['engine', 'Heat engines', 'Converting heat to work, cycles and efficiency.']] },
  B5: { area: 'B', title: 'Current and circuits', icon: 'circuit', sub: 'Charge, current, resistance and circuit analysis.', rows: [
    ['pdcurrent', 'Potential difference, current and resistance', 'The basic electrical quantities and Ohm\'s law.'],
    ['emf', 'Voltage, power and emf', 'Electrical power and the emf of a source.'],
    ['resistors', 'Resistors in electrical circuits', 'Series and parallel combinations.'],
    ['divider', 'Terminal potential difference and the potential divider', 'Internal resistance and dividing a voltage.']] },
  C1: { area: 'C', title: 'Simple harmonic motion', icon: 'spring', sub: 'Oscillations, restoring forces and energy in simple harmonic motion.', rows: [
    ['spring', 'Simple harmonic oscillations', 'What makes an oscillation simple harmonic, and its basic quantities.'],
    ['wave', 'Details of simple harmonic motion', 'Equations and graphs of displacement, velocity and acceleration.'],
    ['ke', 'Energy in simple harmonic motion', 'Exchange between kinetic and potential energy during oscillation.'],
    ['conserve', 'More about energy in SHM', 'Energy graphs and extended problems.']] },
  C2: { area: 'C', title: 'Wave model', icon: 'wave', sub: 'Describing travelling waves and their properties.', rows: [
    ['ripple', 'Mechanical pulses and waves', 'Pulses, wave speed, wavelength, frequency and period.'],
    ['wave', 'Transverse and longitudinal waves', 'The two kinds of wave and how they differ.'],
    ['photon', 'Electromagnetic waves', 'Light and the electromagnetic spectrum.'],
    ['graph', 'Waves extension', 'Extended topics on wave description.']] },
  C3: { area: 'C', title: 'Wave phenomena', icon: 'ripple', sub: 'Reflection, refraction, diffraction, interference and polarization.', rows: [
    ['ripple', 'Reflection and refraction', 'How waves change direction at boundaries.'],
    ['standing', 'The principle of superposition', 'How overlapping waves add together.'],
    ['wave', 'Diffraction and interference', 'Waves spreading round obstacles and combining.'],
    ['linegraph', 'Single-slit diffraction', 'The pattern formed by a single narrow opening.'],
    ['particles', 'Multiple slits', 'Interference from two or more slits and gratings.']] },
  C4: { area: 'C', title: 'Standing waves and resonance', icon: 'standing', sub: 'Standing waves, harmonics and resonance.', rows: [
    ['standing', 'Standing waves', 'How two waves produce nodes and antinodes.'],
    ['spring', 'Standing waves on strings', 'Harmonics on fixed strings.'],
    ['ripple', 'Standing waves in pipes', 'Open and closed pipes and their harmonics.'],
    ['power', 'Resonance and damping', 'Driven oscillations and how energy is lost.']] },
  C5: { area: 'C', title: 'Doppler effect', icon: 'doppler', sub: 'Frequency changes from moving sources and observers.', rows: [
    ['doppler', 'The Doppler effect at low speeds', 'Frequency shift when a source or observer moves slowly.'],
    ['ripple', 'The Doppler effect for sound', 'Moving sources and observers of sound waves.']] },
  D1: { area: 'D', title: 'Gravitational fields', icon: 'planet', sub: 'Newton\'s law of gravitation, field strength and potential.', rows: [
    ['planet', 'Newton\'s law of gravitation', 'The force between two masses.'],
    ['well', 'Gravitational potential and energy', 'Potential in a gravitational field and the energy of a mass.'],
    ['circular', 'Motion in a gravitational field', 'Orbits, escape speed and motion under gravity.']] },
  D2: { area: 'D', title: 'Electric and magnetic fields', icon: 'charge', sub: 'Coulomb\'s law, electric and magnetic fields and potential.', rows: [
    ['charge', 'Electric charge, force and field', 'Coulomb\'s law and electric field strength.'],
    ['magnet', 'Magnetic field and force', 'Magnetic fields and the force on moving charges and currents.'],
    ['emf', 'Electric potential and electric potential energy', 'Potential, potential difference and electric energy.']] },
  D3: { area: 'D', title: 'Motion in electromagnetic fields', icon: 'particle', sub: 'Charged particles moving in electric and magnetic fields.', rows: [
    ['particle', 'Motion in an electric field', 'Charged particles accelerated and deflected by electric fields.'],
    ['circular', 'Motion in a magnetic field', 'Circular and helical paths of charges in magnetic fields.']] },
  D4: { area: 'D', title: 'Induction', icon: 'coil', sub: 'Electromagnetic induction, Faraday\'s law and Lenz\'s law.', rows: [
    ['coil', 'Electromagnetic induction', 'Induced emf, Faraday\'s law and Lenz\'s law.'],
    ['engine', 'Generators and alternating current', 'Generating AC and its properties.']] },
  E1: { area: 'E', title: 'Structure of the atom', icon: 'atom', sub: 'Atomic models, spectra and the energy levels of atoms.', rows: [
    ['atom', 'The structure of the atom', 'Atomic models, spectra and energy levels.'],
    ['circular', 'Quantisation of angular momentum', 'Bohr\'s model and quantised orbits.']] },
  E2: { area: 'E', title: 'Quantum physics', icon: 'photon', sub: 'Photons, the photoelectric effect and matter waves.', rows: [
    ['photon', 'Photons and the photoelectric effect', 'Light as photons and electron emission from surfaces.'],
    ['wave', 'Matter waves', 'De Broglie wavelength and wave behaviour of particles.']] },
  E3: { area: 'E', title: 'Radioactive decay', icon: 'decay', sub: 'Nuclear stability, decay modes and half-life.', rows: [
    ['mole', 'Mass defect and binding energy', 'Why a nucleus weighs less than its parts.'],
    ['decay', 'Radioactivity', 'Alpha, beta and gamma decay.'],
    ['boltz', 'Nuclear properties and the radioactive decay law', 'Nuclear size, decay constant and half-life.']] },
  E4: { area: 'E', title: 'Fission', icon: 'split', sub: 'Nuclear fission and energy generation.', rows: [
    ['split', 'Nuclear fission', 'Splitting heavy nuclei and releasing energy.']] },
  E5: { area: 'E', title: 'Fusion and stars', icon: 'star', sub: 'Nuclear fusion, the Sun and stellar evolution.', rows: [
    ['sun', 'Nuclear fusion', 'Joining light nuclei and releasing energy.'],
    ['graph', 'Stellar properties and the Hertzsprung–Russell diagram', 'Luminosity, temperature and classifying stars.'],
    ['star', 'Stellar evolution extension', 'How stars change over their lifetimes.']] },
  A5: { area: 'A', title: 'Galilean and special relativity', icon: 'well', sub: 'Inertial frames, the speed of light and relativistic effects.', rows: [
    ['frames', 'Reference frames and Lorentz transformations', 'Inertial frames, Lorentz transformations and their use.'],
    ['clock', 'Effects of relativity', 'Time dilation, length contraction and mass\u2013energy equivalence.'],
    ['spacetime', 'Spacetime diagrams', 'Representing and analysing events in spacetime.']] },
};
Object.assign(ICONS, {
  frames: '<path d="M4 20V3M4 3l-2 3M4 3l2 3M4 20h17M21 20l-3-2M21 20l-3 2"/><path d="M4 20L16 8" stroke-dasharray="2 2"/><path d="M8 17c3-1 6-4 9-5M17 12l-3.500.5M17 12l-1.500 3"/>',
  clock: '<circle cx="15" cy="12" r="7"/><path d="M15 8v4l2.500 2M2 8h5M1 12h4M2 16h5"/>',
  spacetime: '<path d="M5 20V4M5 4l-2 3M5 4l2 3M5 20h15M20 20l-3-2M20 20l-3 2"/><path d="M5 20L18 6M5 8l9 9" stroke-dasharray="2 2"/>',
});

Object.assign(ICONS, {
  disp: '<circle cx="5" cy="17" r="2"/><circle cx="19" cy="6" r="2"/><path d="M5 17C9 17 9 10 13 10s2 6 6-4" stroke-dasharray="2 2"/><path d="M6.500 15.500L17.500 7.500"/>',
  accel: '<path d="M3 20h18M4 17l3-1 3-3 3-4 3-6"/><path d="M13 5l5 0 0 5" /><path d="M5 12h4M3 9h4" opacity=".6"/>',
  linegraph: '<path d="M3 3v18h18"/><path d="M6 17l4-6 3 3 6-8"/>',
  projectile: '<path d="M3 20h18"/><path d="M4 19C8 4 16 4 20 19" stroke-dasharray="2 2"/><circle cx="12" cy="6.500" r="2"/>',
  forces: '<circle cx="12" cy="12" r="3"/><path d="M12 9V3M10 5l2-2 2 2M15 12h6M19 10l2 2-2 2M12 15v6M10 19l2 2 2-2M9 12H3M5 10l-2 2 2 2"/>',
  newton: '<circle cx="9" cy="14" r="4"/><path d="M13 14h8M18 11l3 3-3 3M3 21h14"/>',
  circular: '<circle cx="12" cy="12" r="8"/><circle cx="18" cy="9" r="1.800"/><path d="M12 12l6-3M12 12h0"/>',
  work: '<rect x="3" y="10" width="7" height="7"/><path d="M10 13.500h10M17 10.500l3 3-3 3M3 20h18"/>',
  conserve: '<path d="M4 8c0-3 6-3 8 0s8 3 8 0M4 16c0-3 6-3 8 0s8 3 8 0"/><path d="M12 3v18" stroke-dasharray="2 2"/>',
  power: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3M5 5l2 2"/>',
  transfer: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6M13 9l3 3-3 3"/>',
  momentum: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 9l3 3-3 3M3 20h8"/>',
  impulse: '<path d="M3 20V4M3 20h18"/><path d="M5 18V12l4-6 4 6v6z" fill="none"/><path d="M15 18h5" /><path d="M5 18h8" />',
  collide: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M1 12h1M22 12h1M9 12h2M13 12h2"/><path d="M12 5v3M12 16v3M9 7l1.500 2M15 7l-1.500 2" />',
  ke: '<circle cx="12" cy="12" r="4"/><path d="M12 8V2M12 22v-6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>',
  twod: '<circle cx="5" cy="12" r="2.500"/><circle cx="12" cy="12" r="2.500"/><path d="M14.500 10.500L21 5M14.500 13.500L21 19M16 5h5v5M16 19h5v-5"/>',
});

Object.assign(ICONS, {
  particles: '<circle cx="6" cy="7" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="11" cy="14" r="2"/><circle cx="19" cy="16" r="2"/><path d="M8 7l6-1M7 8l3 5M13 14l4 2" opacity=".6"/>',
  phase: '<path d="M3 17c2-3 3-3 5 0s3 3 5 0 3-3 5 0M4 8h5M12 8h8M10 4l2 4-2 4"/>',
  heatflow: '<path d="M4 5h6v14H4zM14 5h6v14h-6zM10 9h4M10 15h4M12 7l2 2-2 2"/>',
  blackbody: '<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  earth: '<circle cx="12" cy="12" r="6"/><path d="M6 12h12M7 8c3 1 7 1 10 0M7 16c3-1 7-1 10 0"/><path d="M2 4l3 2M22 4l-3 2M12 1v3" />',
  mole: '<circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="12" cy="12" r="2"/>',
  boltz: '<path d="M3 20V4M3 20h18"/><path d="M5 18c3-12 6-12 9-2s4 1 6 0"/><path d="M5 18L19 8" stroke-dasharray="2 2"/>',
  internal: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.500"/><circle cx="15" cy="10" r="1.500"/><circle cx="10" cy="15" r="1.500"/><circle cx="16" cy="16" r="1.500"/>',
  law1: '<path d="M3 12h6M15 12h6M9 6h6v12H9z"/><path d="M6 9l3 3-3 3M21 12l-3-3M21 12l-3 3"/>',
  law2: '<path d="M4 4v16h16"/><path d="M6 17l5-4 3 1 5-9"/><path d="M16 5h3v3"/>',
  engine: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.500 5.500l2 2M16.500 16.500l2 2M18.500 5.500l-2 2M7.500 16.500l-2 2"/><circle cx="12" cy="12" r="8"/>',
  pdcurrent: '<path d="M3 12h4l2-5 3 10 2-5h7"/>',
  emf: '<path d="M12 3v18M7 8h10M9 13h6M10 18h4"/>',
  resistors: '<path d="M2 12h3l1.500-4 3 8 3-8 3 8 1.500-4h3"/>',
  divider: '<path d="M12 2v5l-3 1.500 6 2-6 2 6 2-3 1.500V22M15 14h6"/>',
});

const topNav = page => `
  <header class="ph-top">
    <a class="ph-brand" href="#" data-go="home" aria-label="Home">${ic('star', 'star')}<span>IBDP<br>Physics HL</span></a>
    <nav class="ph-nav"><a href="#" data-go="home" class="${page === 'home' ? 'on' : ''}">Home</a><a href="#" data-go="topics" class="${page === 'topics' ? 'on' : ''}">Topics</a><a href="#" data-soon>Practice</a><a href="#" data-soon>Resources</a><a href="#" data-soon>About</a></nav>
    <div class="ph-acts"><button class="ph-iconbtn" data-soon aria-label="Search">${ic('search')}</button></div>
  </header>`;

const esc = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = x => esc(x).replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<span class="frac"><i>$1</i><b>$2</b></span>');
const bi = (en, ja) => `<div class="ph-bi"><p class="en">${fmt(en)}</p>${ja ? `<p class="ja" lang="ja">${fmt(ja)}</p>` : ''}</div>`;
function block(b) {
  switch (b.t) {
    case 'p': return bi(b.en, b.ja);
    case 'h': return `<h4 class="ph-h4"><span class="en">${esc(b.text)}</span>${b.ja ? `<small class="ja" lang="ja">${esc(b.ja)}</small>` : ''}</h4>`;
    case 'eq': return `<div class="ph-eq-block">${b.lines.map(l => `<div>${fmt(l)}</div>`).join('')}</div>`;
    case 'key': return `<aside class="ph-note key"><b>Key point</b>${bi(b.en, b.ja)}</aside>`;
    case 'tip': return `<aside class="ph-note tip"><b>Exam tip</b>${bi(b.en, b.ja)}</aside>`;
    case 'tok': return `<aside class="ph-note tok"><b>Theory of knowledge</b>${bi(b.en, b.ja)}</aside>`;
    case 'ctx': return `<aside class="ph-note ctx"><b>${esc(b.title)}</b>${bi(b.en, b.ja)}</aside>`;
    case 'ex': return `<section class="ph-ex"><h5>${esc(b.no)}</h5><p class="q">${fmt(b.q)}</p><details><summary>Show the solution</summary><ol class="steps">${b.steps.map(x => `<li>${fmt(x)}</li>`).join('')}</ol><p class="ja" lang="ja">${fmt(b.ja)}</p></details></section>`;
    case 'chk': return `<section class="ph-ex chk"><h5>${esc(b.no)}</h5><p class="q">${fmt(b.q)}</p><details><summary>Show the answer</summary><p class="ans">${fmt(b.a)}</p><p class="ja" lang="ja">${fmt(b.ja)}</p></details></section>`;
    case 'fig': return `<figure class="ph-figure">${FIGS[b.id]()}<figcaption><span class="en">${esc(b.cap)}</span><span class="ja" lang="ja">${esc(b.ja)}</span></figcaption></figure>`;
    default: return '';
  }
}
const checkKey = id => `phCheck:${id}`;
const loadChecks = id => { try { return JSON.parse(localStorage.getItem(checkKey(id))) || {}; } catch { return {}; } };

const PAGES = {
  topic: (id = 'A5-1') => {
    const tid = id in TOPICS ? id : 'A5-1', T = TOPICS[tid], subKey = tid.split('-')[0], d = SUBS[subKey], a = AREAS.find(x => x.id === d.area);
    const done = loadChecks(tid);
    return `${topNav('topics')}
    <div class="ph-split ph-doc-split">
      <aside class="ph-side">
        <h3 class="ph-side-t">${ic('star', 'star sm2')}${T.code}</h3><div class="ph-side-rule"></div>
        <ul class="ph-toc">${Object.entries(TOPICS).filter(([k]) => k.startsWith(subKey + '-')).map(([k, x]) => `<li><button class="${k === tid ? 'on' : ''}" data-go="topic:${k}"><code>${x.code}</code><span>${x.title}</span></button></li>`).join('')}</ul>
        <h4 class="ph-toc-h">On this page</h4>
        <nav class="ph-toc-sec">${T.sections.map(s => `<a href="#" data-jump="phs-${tid}-${s.id}">${esc(s.title)}</a>`).join('')}<a href="#" data-jump="phs-${tid}-review">Review</a></nav>
      </aside>
      <section class="ph-main ph-docmain" data-mode="both">
        <div class="ph-crumb"><a href="#" data-go="home" aria-label="Home">${ic('home')}</a><a href="#" data-go="topics">Topics</a>${ic('chev', 'sm')}<a href="#" data-go="area:A">A. Space, time and motion</a>${ic('chev', 'sm')}<a href="#" data-go="sub:${subKey}">${subKey} ${d.title}</a>${ic('chev', 'sm')}<span>${T.code} ${T.title}</span></div>
        <div class="ph-dochead">
          <div class="ph-ahead ph-shead">${ic(T.icon, 'huge')}<div><h2><i>${T.code}</i> ${T.title}</h2><p>${esc(T.lead)}</p><p class="ja" lang="ja">${esc(T.leadJa)}</p></div></div>
          <div class="ph-langs" role="group" aria-label="Language"><button data-mode="both" class="on">EN + 日本語</button><button data-mode="en">EN</button><button data-mode="ja">日本語</button></div>
        </div>
        <div class="ph-doc">
          <section class="ph-sec goals"><h3>Learning objectives <small class="ja" lang="ja">この項目で学ぶこと</small></h3><ul>${T.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul></section>
          ${T.sections.map(s => `<section class="ph-sec" id="phs-${tid}-${s.id}"><h3>${esc(s.title)}</h3>${s.blocks.map(block).join('')}</section>`).join('')}
          <section class="ph-sec" id="phs-${tid}-review"><h3>Review <small class="ja" lang="ja">ふりかえり</small></h3>
            <div class="ph-note reflect"><b>Reflection</b><ul>${T.reflect.map((r, i) => `<li><span class="en">${esc(r)}</span><span class="ja" lang="ja">${esc(T.reflectJa[i])}</span></li>`).join('')}</ul></div>
            <div class="ph-check"><b>Self-assessment checklist <small class="ja" lang="ja">自己チェック</small></b><ul>${T.check.map((c, i) => `<li><label><input type="checkbox" data-chk="${tid}:${i}" ${done[i] ? 'checked' : ''}><span class="en">I am able to ${esc(c)}</span><span class="ja" lang="ja">${esc(T.checkJa[i])}</span></label></li>`).join('')}</ul></div>
          </section>
        </div>
      </section>
    </div>`;
  },

  sub: (id = 'A5') => {
    const d = SUBS[id] || SUBS.A5, a = AREAS.find(x => x.id === d.area), code = id;
    return `${topNav('topics')}
    <div class="ph-split">
      <aside class="ph-side">
        <h3 class="ph-side-t">${ic('star', 'star sm2')}Topics</h3><div class="ph-side-rule"></div>
        <ul>${AREAS.map(x => x.id !== a.id ? `<li><button data-go="area:${x.id}"><span>${x.id}. ${x.title}</span>${ic('chev', 'sm')}</button></li>`
          : `<li class="grp"><button class="open" data-go="area:${x.id}"><span>${x.id}. ${x.title}</span>${ic('down', 'sm')}</button><ul class="subnav">${x.subs.map(([c, n]) => { const k = c.replace('.', ''); return `<li><button class="${k === code ? 'on' : ''}" ${SUBS[k] ? `data-go="sub:${k}"` : 'data-soon'}><code>${k}</code><span>${n}</span>${k === code ? ic('chev', 'sm') : ''}</button></li>`; }).join('')}</ul></li>`).join('')}</ul>
      </aside>
      <section class="ph-main">
        <div class="ph-crumb"><a href="#" data-go="home" aria-label="Home">${ic('home')}</a><a href="#" data-go="topics">Topics</a>${ic('chev', 'sm')}<a href="#" data-go="area:${a.id}">${a.id}. ${a.title}</a>${ic('chev', 'sm')}<span>${code} ${d.title}</span></div>
        <div class="ph-ahead ph-shead">${ic(d.icon, 'huge')}<div><h2><i>${code}</i> ${d.title}</h2><p>${d.sub}</p></div></div>
        <div class="ph-rule slim"><i></i><b>◆</b><i></i></div>
        <ul class="ph-subs ph-leaf">${d.rows.map(([i, t, desc], k) => `<li class="ph-sub plain" ${TOPICS[`${code}-${k + 1}`] ? `data-go="topic:${code}-${k + 1}"` : 'data-soon'} tabindex="0" role="button"><span class="ico">${ic(i, 'lead')}</span><span class="txt"><b>${t}</b><em>${desc}</em></span>${ic('chev', 'sm')}</li>`).join('')}</ul>
      </section>
    </div>`;
  },

  area: (id = 'A') => {
    const a = AREAS.find(x => x.id === id) || AREAS[0], inf = INFO[a.id];
    return `${topNav('topics')}
    <div class="ph-split">
      <aside class="ph-side">
        <h3 class="ph-side-t">${ic('star', 'star sm2')}Topics</h3><div class="ph-side-rule"></div>
        <ul>${AREAS.map(x => `<li><button class="${x.id === a.id ? 'on' : ''}" data-go="area:${x.id}"><span>${x.id}. ${x.title}</span>${ic('chev', 'sm')}</button></li>`).join('')}</ul>
      </aside>
      <section class="ph-main">
        <div class="ph-crumb"><a href="#" data-go="home" aria-label="Home">${ic('home')}</a><a href="#" data-go="topics">Topics</a>${ic('chev', 'sm')}<span>${a.id}. ${a.title}</span></div>
        <div class="ph-ahead">${ic(inf.icon, 'huge')}<div><h2>${a.id}. ${a.title}</h2><p>${inf.sub}</p></div></div>
        <div class="ph-rule slim"><i></i><b>◆</b><i></i></div>
        <ul class="ph-subs">${a.subs.map(([c, n], k) => `<li class="ph-sub" ${SUBS[c.replace('.', '')] ? `data-go="sub:${c.replace('.', '')}"` : 'data-soon'} tabindex="0" role="button">${ic(inf.rows[k][0], 'lead')}<i class="code">${c.replace('.', '')}</i><span class="txt"><b>${n}</b><em>${inf.rows[k][1]}</em></span>${ic('chev', 'sm')}</li>`).join('')}</ul>
      </section>
    </div>`;
  },

  home: () => `${topNav('home')}
  <section class="ph-hero">
    <div class="ph-eyebrow"><i>◆</i> I B D P <i>◆</i></div>
    <h2 class="ph-title">Physics HL</h2>
    <div class="ph-rule"><i></i><b>◆◆</b><i></i></div>
    <p class="ph-tag"><span>◆</span> Study <em>·</em> Practice <em>·</em> Master <span>◆</span></p>
  </section>
  <div class="ph-cards">${CARDS.map(([i, a, b]) => `<button class="ph-card" ${a === 'Topics' ? 'data-go="topics"' : 'data-soon'}>${ic(i, 'big')}<b>${a}</b><em>${b}</em>${ic('arrow', 'sm')}</button>`).join('')}</div>`,

  topics: () => `${topNav('topics')}
  <section class="ph-thead">
    <div class="ph-orbit" aria-hidden="true"><i></i></div>
    <h2 class="ph-title ph-t2">Topics</h2>
    <p class="ph-tag ph-tag2"><span>◆</span> Choose a Topic Area <span>◆</span></p>
  </section>
  <div class="ph-areas">${AREAS.map(a => `<article class="ph-area a-${a.id}" data-go="area:${a.id}" tabindex="0" role="button" aria-label="${a.id}. ${a.title}">
      ${ic(a.icon, 'big')}
      <span class="ph-ah"><b>${a.id}. ${a.title}</b>${ic('chev', 'chev')}</span>
      <ul>${a.subs.map(([c, n]) => `<li data-go="${SUBS[c.replace('.', '')] ? `sub:${c.replace('.', '')}` : `area:${a.id}`}"><code>${c}</code><span>${n}</span></li>`).join('')}</ul>
    </article>`).join('')}</div>`,
};
Object.assign(ICONS, {
  chev: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  planet: '<circle cx="12" cy="12" r="5"/><path d="M2.500 15c-1.500-3 4-7.500 11-9.500M21.500 9c1.500 3-4 7.500-11 9.500"/>',
  graph: '<path d="M3 3v18h18"/><path d="M5 19C9 18 12 14 14 8c1-3 3-4 5-4"/><circle cx="17" cy="5" r="1.200"/><path d="M17 6.500V19M5 8h12" stroke-dasharray="1.500 2"/>',
  block: '<rect x="6" y="8" width="8" height="7"/><path d="M14 11.500h7M18.500 9l2.500 2.500-2.500 2.500M3 18h18M4 21l2-3M8 21l2-3M12 21l2-3M16 21l2-3"/>',
  bolt: '<path d="M13 2L5 13.500h6L10 22l9-12h-6.500z"/>',
  cube: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10" stroke-dasharray="2 2"/>',
  well: '<ellipse cx="12" cy="5" rx="9" ry="2.500"/><path d="M3 5c3 5 5 8 7 13M21 5c-3 5-5 8-7 13M10 18h4M7 8c3 2 7 2 10 0M8.500 12c2 1.500 5 1.500 7 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  gas: '<rect x="3" y="4" width="18" height="16" rx="1.500"/><circle cx="8" cy="9" r="1.500"/><circle cx="15" cy="8" r="1.500"/><circle cx="11" cy="14" r="1.500"/><circle cx="17" cy="15" r="1.500"/><path d="M8 9l3 5M15 8l2 7" stroke-dasharray="1 2"/>',
  cycle: '<path d="M5 18V6l5 3 4 5 5 1M5 18h14"/><path d="M12 4l2 2-2 2M19 15l-2-2"/>',
  circuit: '<path d="M4 6h16v12H4zM9 6v-0M4 12h4M16 12h4"/><path d="M8 9v6M11 10v4"/><circle cx="14.500" cy="12" r="1.500"/>',
  spring: '<path d="M12 2v4l-4 1.500 8 2-8 2 8 2-8 2 4 1.500v5"/>',
  ripple: '<circle cx="9" cy="12" r="3"/><circle cx="9" cy="12" r="6.500"/><circle cx="16" cy="12" r="3"/><circle cx="16" cy="12" r="6.500"/>',
  standing: '<path d="M3 12c2-7 4-7 6 0s4 7 6 0 4-7 6 0"/><path d="M3 12c2 7 4 7 6 0s4-7 6 0 4 7 6 0" opacity=".6"/>',
  doppler: '<circle cx="8" cy="12" r="2"/><path d="M12 7c2 3 2 7 0 10M15.500 5c3 4.500 3 9.500 0 14M19 3c4 6 4 12 0 18"/>',
  charge: '<circle cx="12" cy="12" r="3"/><path d="M12 7V3M12 21v-4M7 12H3M21 12h-4M8.500 8.500l-2-2M17.500 17.500l-2-2M15.500 8.500l2-2M6.500 17.500l2-2"/><path d="M11 12h2M12 11v2"/>',
  particle: '<circle cx="6" cy="18" r="1.800"/><path d="M7 16.500C10 12 12 8 18 6M15 4l3 2-2 3"/><path d="M4 8h2M9 8h2M14 8h2M4 12h2M9 12h2M4 4h2M9 4h2" opacity=".5"/>',
  coil: '<path d="M3 12c0-4 3-4 3 0s3 4 3 0 3-4 3 0 3 4 3 0 3-4 3 0"/><path d="M3 12h-1M21 12h1M12 4v3M10.500 5.500L12 4l1.500 1.500"/>',
  atom: ICONS.atom,
  photon: '<path d="M2 12c2-6 4-6 6 0s4 6 6 0 3-4 4-2M16 8l5 4-5 4"/>',
  decay: '<circle cx="9" cy="12" r="4"/><circle cx="9" cy="12" r="1.200"/><path d="M14 9l6-3M14 12h7M14 15l6 3"/>',
  split: '<circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M5 5l3 3M19 5l-3 3M5 19l3-3M19 19l-3-3" opacity=".6"/>',
  star: ICONS.star,
});

const scene = `
  <div class="ph-scene" id="ph-scene" aria-hidden="true">
    <span class="ph-eq e1">F = ma</span><span class="ph-eq e2">E = mc<sup>2</sup></span><span class="ph-eq e3">p = mv</span><span class="ph-eq e4">v<sup>2</sup> = u<sup>2</sup> + 2as</span>
    <svg class="ph-wave" viewBox="0 0 300 110"><path d="M0 55 C 25 -5, 50 -5, 75 55 S 125 115, 150 55 S 200 -5, 225 55 S 275 115, 300 55"/></svg>
    <svg class="ph-field" viewBox="0 0 200 200"><g class="lines">${Array.from({ length: 18 }, (_, i) => `<line x1="100" y1="100" x2="${(100 + 98 * Math.cos(i * Math.PI / 9)).toFixed(1)}" y2="${(100 + 98 * Math.sin(i * Math.PI / 9)).toFixed(1)}"/>`).join('')}</g><circle cx="100" cy="100" r="40"/><circle cx="100" cy="100" r="70"/><circle class="core" cx="100" cy="100" r="3.500"/></svg>
    <svg class="ph-armil" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"/><ellipse class="r1" cx="60" cy="60" rx="50" ry="18"/><ellipse class="r2" cx="60" cy="60" rx="18" ry="50"/><ellipse class="r3" cx="60" cy="60" rx="38" ry="50"/><circle cx="60" cy="60" r="4"/></svg>
    <svg class="ph-glass" viewBox="0 0 80 130"><path class="frame" d="M10 6h60M10 124h60M16 6c0 38 20 44 24 59-4 15-24 21-24 59M64 6c0 38-20 44-24 59 4 15 24 21 24 59"/><path class="top" d="M24 16c6 14 12 18 16 22 4-4 10-8 16-22z"/><path class="bot" d="M40 70c10 18 18 28 22 46H18c4-18 12-28 22-46z"/><line class="fall" x1="40" y1="64" x2="40" y2="116"/></svg>
  </div>`;
stage.innerHTML = `${scene}<div class="ph-body" id="ph-body"></div>`;
const body = document.getElementById('ph-body');
let page = 'home';
function show(target) {
  let [next, arg] = String(target).split(':');   // 例: 'area:A'
  if (!(next in PAGES)) next = 'home';
  page = next;
  body.innerHTML = PAGES[next](arg);
  body.className = `ph-body ph-p-${next}`;
  body.style.animation = 'none'; void body.offsetWidth; body.style.animation = '';   // 同じ動きを、毎回はじめからやり直す
  stage.dataset.page = next;
  host.dataset.page = next;
  punch = performance.now() / 1000;
  try { sessionStorage.phPage = arg ? `${next}:${arg}` : next; } catch {}
}

let toastTimer = 0;
function say(msg) {
  toast.textContent = msg; toast.hidden = false; toast.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.classList.remove('on'); setTimeout(() => { toast.hidden = true; }, 300); }, 1600);
}
stage.addEventListener('click', e => {
  const jump = e.target.closest('[data-jump]');
  if (jump) { e.preventDefault(); const t = stage.querySelector('#' + jump.dataset.jump); t?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const lm = e.target.closest('.ph-langs button');
  if (lm) { stage.querySelector('.ph-docmain').dataset.mode = lm.dataset.mode; lm.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === lm)); return; }
  const go = e.target.closest('[data-go]');
  if (go) { e.preventDefault(); show(go.dataset.go); return; }
  if (e.target.closest('[data-soon]')) { e.preventDefault(); say('Coming soon'); }
});
let start0 = 'home';
try { if (String(sessionStorage.phPage).split(':')[0] in PAGES) start0 = sessionStorage.phPage; } catch {}
show(start0);
stage.addEventListener('change', e => {   // 自己チェックの保存
  const c = e.target.closest('[data-chk]'); if (!c) return;
  const [id, i] = c.dataset.chk.split(':'); const cur = loadChecks(id); cur[i] = c.checked;
  try { localStorage.setItem(checkKey(id), JSON.stringify(cur)); } catch {}
});
stage.addEventListener('keydown', e => {   // Enter で、押せる行を開く
  const row = e.target.closest('[tabindex][data-go], [tabindex][data-soon]');
  if (row && e.key === 'Enter') row.click();
});

// ページを切り替えるたびに、背景がぐっと奥へ引き込まれ、衝撃波が走る(Computer Science と同じ演出)
const view = createGpuView(WGSL, now => {
  const x = Math.min(1, Math.max(0, (now - punch) / 1.1));
  const pulse = x < 1 ? Math.sin(Math.PI * x) * 0.9 : 0;
  return [0, 0, now - punch, pulse];
});
export const physics = { start: () => view.start(host), stop: () => view.stop() };
