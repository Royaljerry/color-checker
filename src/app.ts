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
// String Literals
// ================================================

// ToDo (e.g. 'Same color')

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

// ToDo: unify 'else' branches

function setClass(element: Element, className: string) {
	if (element) {
		element.classList.add(className);
	} else {
		console.warn(`${element} not found (class).`);
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
		console.warn(`${element} not found (text).`);
	}
}

function setData(element: HTMLElement, key: string, value: string) {
	if (element) {
		element.dataset[key] = value;
	} else {
		console.warn(`${element} not found (data).`);
	}
}

// ================================================
// Handlers
// ================================================

function sum() {
	// ToDo (error): get selectedBoxes!
	const selectedBoxes = Array.from(document.querySelectorAll('.hover')).filter((box) => (box as HTMLElement).dataset.active === 'true');
	setStyle(elem('.selection')!, 'display', 'none');
	setStyle(elem('.sum')!, 'display', 'none');
	setStyle(elem('.result')!, 'display', 'block');
	console.log(selectedBoxes);
	// selection.style.display = 'none';
	// buttonSum.style.display = 'none';
	// result.style.display = 'block';
	for (const color of CC_COLORS_INCLUDED) {
		makeLegend('result', color);
	}
	if (selectedBoxes.length) {
		/**
		 * makeBox:
		 * mode: LegendMode,
		 * backgroundColor: Color,
		 * foregroundColor: Color
		 */
		selectedBoxes.forEach((box) => {
			// console.log(box.colors.background);
			// makeBox('result', box.colors.background, box.colors.foreground);
		});
	} else {
		resultTitleSelected.style.display = 'none';
		resultSelected.style.display = 'none';
	}
}

function reset() {
	document.location.reload();
}

// ================================================
// Parts
// ================================================

function makeLegend(
		mode: LegendMode,
		backgroundColor: Color
	) {
	const legend = document.createElement('div');
	setClass(legend, 'box');
	setClass(legend, 'legend');
	setClass(legend, `legend--${mode}`);
	setStyle(legend, 'backgroundColor', backgroundColor.valueHex);
	setStyle(legend, 'color', backgroundColor.type === 'dark' ? 'var(--color-white)' : 'var(--color-dark)');
	setText(legend, `<p class="name">${backgroundColor.name}</p><p class="value upper">${backgroundColor.valueHex}</p>`);
	elem('.selection')!.appendChild(legend);
}

function makeBox(
		mode: LegendMode,
		backgroundColor: Color,
		foregroundColor: Color
	) {
	const box = document.createElement('div');
	if (foregroundColor !== backgroundColor) {
		setData(box, 'active', 'false');
		setData(box, 'background', backgroundColor.name);
		setData(box, 'foreground', foregroundColor.name);
		setClass(box, 'box');
		setStyle(box, 'backgroundColor', backgroundColor.valueHex);
		setStyle(box, 'color', foregroundColor.valueHex);
		switch (mode) {
			case 'select':
				setClass(box, 'hover');
				setClass(box, 'box--selectable');
				if (backgroundColor.type === 'dark') setClass(box, 'hover--dark');
				setText(box, `<p class="name">${foregroundColor.name}</p><p class="value upper">${foregroundColor.valueHex}</p>`);
				box.onclick = () => {
					setData(box, 'active', negate(box.dataset.active!));
					if (box.dataset.active === 'true') {
						setStyle(box, 'border', '3px var(--color-accent) solid');
					} else {
						setStyle(box, 'border', 'none');
					}
				};
				break;
			case 'result':
				setText(box, `<p class="name"><span class="upper">FG: </span>${foregroundColor.name}</p><p class="name nomargin"><span class="upper">BG: </span>${backgroundColor.name}</p>`);
				break;
		}
	} else {
		setClass(box, 'box');
		setClass(box, 'same-color');
		setText(box, 'Same color');
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
