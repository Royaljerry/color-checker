// ****************************************************************
// TYPES
// ****************************************************************

interface Data {
	colors: Color[];
}

type ColorType = 'light' | 'dark';

interface Color {
	name: string;
	valueHex: string;
	type: ColorType;
	include?: boolean;
}

// ****************************************************************
// VARIABLES
// ****************************************************************

// ================================================
// Constants
// ================================================

let CC_DATA: any = {};
let NUMBER_OF_PARTS: Color[];

// ****************************************************************
// FUNCTIONS
// ****************************************************************

// ================================================
// Helpers
// ================================================

function getParts(colors: Color[]): any {
	return colors.filter((color: Color) => color.include !== false);
}

// ================================================
// Handlers
// ================================================

// ================================================
// Initializers
// ================================================

// function initSelection(colors: Color[]) {
// 	for (const colorRow in colors) {
// 		if (colors[colorRow].include !== false) {
// 			makeLegend('select', selection, colorRow);
// 			for (const colorCol in colors) {
// 				if (colors[colorCol].include !== false) {
// 					makeBox('select', selection, colorRow, colorCol);
// 				}
// 			}
// 		}
// 	}
// }

// ================================================
// Updaters
// ================================================

// ****************************************************************
// MAIN ENTRY POINT
// ****************************************************************

async function init() {
	const request = new Request('./data.json');
	const response = await fetch(request);
	const data = await response.json();

	console.log(getParts(data.colors));
}

init();
