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

// ToDo: use glob object for these constants

let CC_DATA: any = {};
let CC_COLORS_INCLUDED: Color[];

// ================================================
// DOM-parts
// ================================================

// ToDo: eliminate these variables, use values directly

// const selection = elem('.selection') as HTMLDivElement;
// const buttonSum = elem('.sum') as HTMLDivElement;
const result = elem('.result') as HTMLDivElement;
const resultUsed = elem('.result__colors-used') as HTMLDivElement;
const resultTitleSelected = elem('.result__title-selected') as HTMLDivElement;
const resultSelected = elem('.result__colors-selected') as HTMLDivElement;
// const buttonReset = elem('.reset') as HTMLDivElement;

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
// DOM
// ================================================

// --------------------------------
// Get
// --------------------------------

function elem(selector: string): Element | null {
	return document.querySelector(selector);
}

function elems(selector: string): NodeListOf<Element> | null {
	return document.querySelectorAll(selector);
}

// --------------------------------
// Set
// --------------------------------

function setClass(element: Element, className: string) {
	if (element) {
		element.classList.add(className);
	} else {
		console.warn(`${element} not found (class).`)
	}
}

function setStyle(element: Element, property: string, value: string) {
	if (element) {
		((element as HTMLElement).style as any)[property] = value
	} else {
		console.warn(`${element} not found (style).`)
	};
}

function setText(element: Element, content: string) {
	if (element) {
		element.innerHTML = content;
	} else {
		console.warn(`${element} not found (text).`)
	}
}

// ================================================
// Handlers
// ================================================

function sum() {
	console.log('SUM');
}

function reset() {
	console.log('RESET');
}

// ================================================
// Parts
// ================================================

function makeLegend(
		mode: LegendMode,
		backgroundColor: Color
	) {
	const legend = document.createElement('div');
	legend.classList.add('box');
	legend.classList.add('legend');
	legend.classList.add(`legend--${mode}`);

	setStyle(legend, 'backgroundColor', backgroundColor.valueHex);
	setStyle(legend, 'color', backgroundColor.type === 'dark' ? 'var(--color-white)' : 'var(--color-dark)');
	legend.innerHTML = `<p class="name">${backgroundColor.name}</p><p class="value upper">${backgroundColor.valueHex}</p>`;
	elem('.selection')!.appendChild(legend);
}

function makeBox(
		mode: LegendMode,
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
	elem('.selection')!.appendChild(box);
}

// ================================================
// Initializers
// ================================================

function initSelection() {
	for (const colorRow of CC_COLORS_INCLUDED) {
		makeLegend('select', colorRow);
		for (const colorCol of CC_COLORS_INCLUDED) {			
			makeBox('select', colorRow, colorCol);
		}
	}

	setStyle(elem('.selection')!, 'gridTemplateColumns', `1.5fr repeat(${CC_COLORS_INCLUDED.length}, 1fr)`);
	setStyle(elem('.selection')!, 'gridTemplateRows', `repeat(${CC_COLORS_INCLUDED.length}, 1fr)`);

	elem('.sum')?.addEventListener('click', sum);
	elem('.reset')?.addEventListener('click', reset);
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
