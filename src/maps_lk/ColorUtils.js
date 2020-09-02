
const OPACITY = 0.5;

function getReverseIndex(valueList) {
  return valueList.sort().reduce(
    function(reverseIndex, value, i) {
      reverseIndex[value] = i;
      return reverseIndex;
    },
    {},
  );
}

export function getHSLA(h, s, l, a) {
  return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a  + ')';
}

export function getFilter(h, s, l, a) {
  a = 1 - l / 100;
  const b = 100;
  return 'hue-rotate(' + h + 'deg) brightness( ' + b
    + '%) saturate(' + s + '%) opacity(' + (a * 100) + '%)';
}

export function getSingleColorPalette(h, minL, maxL, s) {
  function palette(valueList, value) {
    const reverseIndex = getReverseIndex(valueList);
    const p = reverseIndex[value] / (valueList.length - 1);
    const l = Math.floor(minL * (1 - p) +  maxL * p);
    return [h, s, l, OPACITY];
  };
  return palette;
}

export function getTwoColorPalette(minH, maxH) {
  function palette(valueList, value) {
    const reverseIndex = getReverseIndex(valueList);
    const p = reverseIndex[value] / (valueList.length - 1);

    const h = Math.floor(minH * (1 - p) +  maxH * p);
    return [h, 100, 50, OPACITY];
  };
  return palette;
}

export const SL_MAROON_PALETTE = getSingleColorPalette(355, 90, 40, 100);
export const SL_ORANGE_PALETTE = getSingleColorPalette(21, 90, 40, 100);
export const SL_YELLOW_PALETTE = getSingleColorPalette(43, 90, 40, 100);
export const SL_GREEN_PALETTE = getSingleColorPalette(165, 90, 40, 100);

export const BLUE_PALETTE = getSingleColorPalette(240, 90, 40, 100);
export const GRAY_PALETTE = getSingleColorPalette(240, 90, 40, 0);

export const RED_GREEN_PALETTE = getTwoColorPalette(0, 120);
export const BLUE_RED_PALETTE = getTwoColorPalette(240, 0);
export const GREEN_RED_PALETTE = getTwoColorPalette(120, 0);

export const PALETTE_LIST = [
  SL_MAROON_PALETTE,
  SL_ORANGE_PALETTE,
  SL_YELLOW_PALETTE,
  SL_GREEN_PALETTE,
  BLUE_PALETTE,

  GRAY_PALETTE,

  RED_GREEN_PALETTE,
  GREEN_RED_PALETTE,
  BLUE_RED_PALETTE,
]
