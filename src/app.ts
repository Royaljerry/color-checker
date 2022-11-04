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
let NUMBER_OF_PARTS: Color[];

// ================================================
// DOM-parts
// ================================================

const selection = document.querySelector('.selection');
const buttonSum = document.querySelector('.sum');
const result = document.querySelector('.result');
const resultUsed = document.querySelector('.result__colors-used');
const resultTitleSelected = document.querySelector('.result__title-selected');
const resultSelected = document.querySelector('.result__colors-selected');
const buttonReset = document.querySelector('.reset');

// ****************************************************************
// FUNCTIONS
// ****************************************************************

// ================================================
// Helpers
// ================================================

function getParts(colors: Color[]): Color[] {
	return colors.filter((color: Color) => color.include !== false);
}

function getColorByName(colors: Color[], name: string): Color {
	return colors.filter((color: Color) => color.name === name)[0];
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
		colors: Color[],
		mode: LegendMode,
		targetElement: HTMLDivElement,
		background: string
	) {
	const legend = document.createElement('div');
	legend.classList.add('box');
	legend.classList.add('legend');
	legend.classList.add(`legend--${mode}`);
	legend.style.backgroundColor = getColorByName(colors, background).valueHex;
	legend.style.color = getColorByName(colors, background).type === 'dark' ? 'var(--color-white)' : 'var(--color-dark)';
	legend.innerHTML = `<p class="name">${background}</p><p class="value upper">${getColorByName(colors, background).valueHex}</p>`;
	targetElement.appendChild(legend);
}

function makeBox(
		colors: Color[],
		mode: LegendMode,
		targetElement: HTMLDivElement,
		background: string,
		foreground: string
	) {
	const box = document.createElement('div');
	if (foreground !== background) {
		box.dataset.active = 'false';
		box.dataset.background = background;
		box.dataset.foreground = foreground;
		box.classList.add('box');
		box.style.backgroundColor = colors[background].value;
		box.style.color = colors[foreground].value;
		switch (mode) {
			case 'select':
				box.classList.add('hover');
				box.classList.add('box--selectable');
				if (colors[background].type === 'dark') box.classList.add('hover--dark');
				box.innerHTML = `
					<p class="name">${foreground}</p>
					<p class="value upper">${colors[foreground].value}</p>
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
					<p class="name"><span class="upper">FG: </span>${foreground}</p>
					<p class="name nomargin"><span class="upper">BG: </span>${background}</p>
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

function initSelection(colors: Color[]) {
	for (const colorRow in colors) {
		if (colors[colorRow].include !== false) {
			makeLegend(colors, 'select', selection, colorRow);
			for (const colorCol in colors) {
				if (colors[colorCol].include !== false) {
					makeBox(colors, 'select', selection, colorRow, colorCol);
				}
			}
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
	const data = await response.json();

	initSelection(data.colors)

	console.log(getParts(data.colors));
}

init();
