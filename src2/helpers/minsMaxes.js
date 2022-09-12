const isInfinity = num => num < -10000000 || num > 10000000;

export function minsMaxes(turtles) {
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;

  for (const turtle of turtles) {
    let {
      xMin: curMinX,
      yMin: curMinY,
      xMax: curMaxX,
      yMax: curMaxY
    } = turtle.extrema();

    if (xMin > curMinX) xMin = curMinX;
    if (xMax < curMaxX) xMax = curMaxX;
    if (yMin > curMinY) yMin = curMinY;
    if (yMax < curMaxY) yMax = curMaxY;

  }

    if (isInfinity(xMin)) xMin = 0;
    if (isInfinity(xMax)) xMax = 0;
    if (isInfinity(yMin)) yMin = 0;
    if (isInfinity(yMax)) yMax = 0;

  return {xMin, xMax, yMin, yMax};
}