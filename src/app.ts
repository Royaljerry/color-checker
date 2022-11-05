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

function makeBox(
		mode: LegendMode,
		targetElement: HTMLDivElement,
		backgroundColor: Color,
		foregroundColor: Color
	) {
	const box = document.createElement('div');
	if (foregroundColor !== backgroundColor) {
		box.dataset.active = 'false';
		box.dataset.background = backgroundColor.name;
		box.dataset.foreground = foregroundColor.name;
		box.classList.add('box');
		box.style.backgroundColor = backgroundColor.valueHex;
		box.style.color = foregroundColor.valueHex;
		switch (mode) {
			case 'select':
				box.classList.add('hover');
				box.classList.add('box--selectable');
				if (backgroundColor.type === 'dark') box.classList.add('hover--dark');
				box.innerHTML = `
					<p class="name">${foregroundColor}</p>
					<p class="value upper">${foregroundColor.valueHex}</p>
				`;
				box.onclick = () => {
					box.dataset.active = negate(box.dataset.active!);
					if (box.dataset.active === 'true') {
						box.style.border = '3px var(--color-accent) solid';
					} else {
						box.style.border = 'none';
					}
				};
				break;
			case 'result':
				box.innerHTML = `
					<p class="name"><span class="upper">FG: </span>${foregroundColor}</p>
					<p class="name nomargin"><span class="upper">BG: </span>${backgroundColor}</p>
				`;
				break;
		}
	} else {
		box.classList.add('box');
		box.innerHTML = 'Same color';
		box.classList.add('same-color')
	}
	targetElement.appendChild(box);
}

function initSelection() {
	for (const colorRow of CC_COLORS_INCLUDED) {
		console.log(colorRow.valueHex);
		makeLegend('select', selection, colorRow);
		for (const colorCol of CC_COLORS_INCLUDED) {			
			console.log(colorCol.valueHex);
			makeBox('select', selection, colorRow, colorCol);
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
