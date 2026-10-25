// Menu order and symbols: manual/10-constants.md, Ch-21–23.
// Values: CODATA 2010, as specified by the manual.
// https://physics.nist.gov/cuu/Constants/ArchiveASCII/allascii_2010.txt
const vacuumPermeability = 4 * Math.PI * 1e-7;
const lightSpeed = 299792458;
const entries = [
  ['mp', 'Proton mass', '1.672621777e-27', 'kg'],
  ['mn', 'Neutron mass', '1.674927351e-27', 'kg'],
  ['me', 'Electron mass', '9.10938291e-31', 'kg'],
  ['mμ', 'Muon mass', '1.883531475e-28', 'kg'],
  ['a₀', 'Bohr radius', '5.2917721092e-11', 'm'],
  ['h', 'Planck constant', '6.62606957e-34', 'J s'],
  ['μN', 'Nuclear magneton', '5.05078353e-27', 'J T⁻¹'],
  ['μB', 'Bohr magneton', '9.27400968e-24', 'J T⁻¹'],
  ['ℏ', 'Reduced Planck constant', '1.054571726e-34', 'J s'],
  ['α', 'Fine-structure constant', '7.2973525698e-3', ''],
  ['rₑ', 'Classical electron radius', '2.8179403267e-15', 'm'],
  ['λc', 'Electron Compton wavelength', '2.4263102389e-12', 'm'],
  ['γp', 'Proton gyromagnetic ratio', '2.675222005e8', 's⁻¹ T⁻¹'],
  ['λcp', 'Proton Compton wavelength', '1.32140985623e-15', 'm'],
  ['λcn', 'Neutron Compton wavelength', '1.3195909068e-15', 'm'],
  ['R∞', 'Rydberg constant', '10973731.568539', 'm⁻¹'],
  ['u', 'Atomic mass constant', '1.660538921e-27', 'kg'],
  ['μp', 'Proton magnetic moment', '1.410606743e-26', 'J T⁻¹'],
  ['μe', 'Electron magnetic moment', '-9.28476430e-24', 'J T⁻¹'],
  ['μn', 'Neutron magnetic moment', '-9.6623647e-27', 'J T⁻¹'],
  ['μμ', 'Muon magnetic moment', '-4.49044807e-26', 'J T⁻¹'],
  ['F', 'Faraday constant', '96485.3365', 'C mol⁻¹'],
  ['e', 'Elementary charge', '1.602176565e-19', 'C'],
  ['Nₐ', 'Avogadro constant', '6.02214129e23', 'mol⁻¹'],
  ['k', 'Boltzmann constant', '1.3806488e-23', 'J K⁻¹'],
  ['Vm', 'Ideal-gas molar volume (273.15 K, 101.325 kPa)', '22.413968e-3', 'm³ mol⁻¹'],
  ['R', 'Molar gas constant', '8.3144621', 'J mol⁻¹ K⁻¹'],
  ['c₀', 'Speed of light in vacuum', String(lightSpeed), 'm s⁻¹'],
  ['c₁', 'First radiation constant', '3.74177153e-16', 'W m²'],
  ['c₂', 'Second radiation constant', '1.4387770e-2', 'm K'],
  ['σ', 'Stefan–Boltzmann constant', '5.670373e-8', 'W m⁻² K⁻⁴'],
  ['ε₀', 'Vacuum permittivity', String(1 / (vacuumPermeability * lightSpeed ** 2)), 'F m⁻¹'],
  ['μ₀', 'Vacuum permeability', String(vacuumPermeability), 'N A⁻²'],
  ['Φ₀', 'Magnetic flux quantum', '2.067833758e-15', 'Wb'],
  ['g', 'Standard gravitational acceleration', '9.80665', 'm s⁻²'],
  ['G₀', 'Conductance quantum', '7.7480917346e-5', 'S'],
  ['Z₀', 'Vacuum characteristic impedance', String(vacuumPermeability * lightSpeed), 'Ω'],
  ['t', 'Celsius temperature offset', '273.15', 'K'],
  ['G', 'Newtonian gravitational constant', '6.67384e-11', 'm³ kg⁻¹ s⁻²'],
  ['atm', 'Standard atmosphere', '101325', 'Pa'],
];

export const SCIENTIFIC_CONSTANTS = Object.freeze(entries.map(([symbol, name, value, unit], index) => Object.freeze({
  symbol, name, value, unit, token: `[${String(index + 1).padStart(2, '0')}]`,
})));
export const CONSTANT_PAGE_COUNT = SCIENTIFIC_CONSTANTS.length / 4;
export function displayConstants(expression) {
  return expression.replace(/\[(\d{2})\]/g, (token, code) => SCIENTIFIC_CONSTANTS[Number(code) - 1]?.symbol ?? token);
}
