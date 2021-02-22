const thousand = 1_000;
const million = 1_000_000;
const billion = 1_000_000_000;
const trillion = 1_000_000_000_000;
const quadrilion = 1000000000000000;

/**
 * Function to format a number for display on screen.
 * @param input Number to format
 * @param decimals How many decimals do you want
 */
export function formatNumber(input: number, decimals: number) : string {
    if (!input) input = 0;
    if (input < 0) return "-" + formatNumber(-1 * input, decimals);
    if (input >= quadrilion)
        return input.toExponential(decimals).replace("+", "");
    if (input >= trillion)
        return (input / trillion).toFixed(decimals) + 'T';
    if (input >= billion)
        return (input / billion).toFixed(decimals) + 'B';
    if (input >= million)
        return (input / million).toFixed(decimals) + 'M';
    if (input >= thousand)
        return (input / thousand).toFixed(decimals) + 'K';

    return input.toFixed(decimals);
}

/**
 * Function to format a number for display on screen.
 * Will only show decimal places when the number is abbreviated.
 * @param input Number to format
 */
export function formatWhole(input: number) : string {
    if (!input) input = 0;
    if (input < 0) return "-" + formatWhole(-1 * input);
    if (input < thousand) return formatNumber(input, 0);
    return formatNumber(input, 2);
}

/**
 * Function to calculate the distance between 2 points
 * @param x1 number
 * @param y1 number
 * @param x2 number
 * @param y2 number
 */
export function distanceBetweenPoints(x1 : number, y1 : number, x2 : number, y2 : number) : number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

/**
 * Normalize a vector of x and y
 * @param x 
 * @param y 
 */
export function normalizeVector(x : number, y : number) : {x: number, y: number} {
    if (x == 0 && y == 0) {
        return {x:x,y:y};
      }
  
      const magnitude = Math.sqrt(x * x + y * y);
      x /= magnitude;
      y /= magnitude;
      return {x:x,y:y};
}