// ****************************************************************
// TYPES
// ****************************************************************

interface Data {
	colors: Color[];
}

type ColorType = 'light' | 'dark';

type LegendMode = 'select' | 'result';

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
let CC_COLORS_INCLUDED: Color[];

// ================================================
// DOM-parts
// ================================================

const selection = document.querySelector('.selection') as HTMLDivElement;
const buttonSum = document.querySelector('.sum') as HTMLDivElement;
const result = document.querySelector('.result') as HTMLDivElement;
const resultUsed = document.querySelector('.result__colors-used') as HTMLDivElement;
const resultTitleSelected = document.querySelector('.result__title-selected') as HTMLDivElement;
const resultSelected = document.querySelector('.result__colors-selected') as HTMLDivElement;
const buttonReset = document.querySelector('.reset') as HTMLDivElement;

// ****************************************************************
// FUNCTIONS
// ****************************************************************

// ================================================
// Helpers
// ================================================

function getColorsIncluded(): Color[] {
	return CC_DATA.colors.filter((color: Color) => color.include !== false);
}

function getColorByName(name: string): Color {
	return CC_DATA.colors.filter((color: Color) => color.name === name)[0];
}

function negate(value: string): string {
	return value === 'false' ? 'true' : 'false';
}

// ================================================
// Handlers
// ================================================

// ================================================
// Initializers
// ================================================

function makeLegend(
		mode: LegendMode,
		targetElement: HTMLDivElement,
		backgroundColor: Color
	) {
	const legend = document.createElement('div');
	legend.classList.add('box');
	legend.classList.add('legend');
	legend.classList.add(`legend--${mode}`);
	legend.style.backgroundColor = backgroundColor.valueHex;
	legend.style.color = backgroundColor.type === 'dark' ? 'var(--color-white)' : 'var(--color-dark)';
	legend.innerHTML = `<p class="name">${backgroundColor.name}</p><p class="value upper">${backgroundColor.valueHex}</p>`;
	targetElement.appendChild(legend);
}

// function makeBox(
// 		colors: Color[],
// 		mode: LegendMode,
// 		targetElement: HTMLDivElement,
// 		background: string,
// 		foreground: string
// 	) {
// 	const box = document.createElement('div');
// 	if (foreground !== background) {
// 		box.dataset.active = 'false';
// 		box.dataset.background = background;
// 		box.dataset.foreground = foreground;
// 		box.classList.add('box');
// 		box.style.backgroundColor = getColorByName(colors, background).valueHex;
// 		box.style.color = getColorByName(colors, foreground).valueHex;
// 		switch (mode) {
// 			case 'select':
// 				box.classList.add('hover');
// 				box.classList.add('box--selectable');
// 				if (getColorByName(colors, background).type === 'dark') box.classList.add('hover--dark');
// 				box.innerHTML = `
// 					<p class="name">${foreground}</p>
// 					<p class="value upper">${getColorByName(colors, foreground).valueHex}</p>
// 				`;
// 				box.onclick = () => {
// 					box.dataset.active = negate(box.dataset.active!);
// 					if (box.dataset.active === 'true') {
// 						box.style.border = '3px var(--color-accent) solid';
// 					} else {
// 						box.style.border = 'none';
// 					}
// 				};
// 				break;
// 			case 'result':
// 				box.innerHTML = `
// 					<p class="name"><span class="upper">FG: </span>${foreground}</p>
// 					<p class="name nomargin"><span class="upper">BG: </span>${background}</p>
// 				`;
// 				break;
// 		}
// 	} else {
// 		box.classList.add('box');
// 		box.innerHTML = 'Same color';
// 		box.classList.add('same-color')
// 	}
// 	targetElement.appendChild(box);
// }

function initSelection() {
	for (const colorRow of CC_COLORS_INCLUDED) {
		console.log(colorRow.valueHex);
		makeLegend('select', selection, colorRow);
		for (const colorCol of CC_COLORS_INCLUDED) {			
			console.log(colorCol.valueHex);
			// makeBox(colors, 'select', selection, getColorByName(colors, colors[colorRow].name).valueHex, getColorByName(colors, colors[colorCol].name).valueHex);
		}
	}
}

// ================================================
// Updaters
// ================================================

// ****************************************************************
// MAIN ENTRY POINT
// ****************************************************************

async function init() {
	const request = new Request('./data.json');
	const response = await fetch(request);
	
	CC_DATA = await response.json();
	CC_COLORS_INCLUDED = getColorsIncluded();

	initSelection();
}

init();
