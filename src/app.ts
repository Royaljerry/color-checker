// ****************************************************************
// TYPES
// ****************************************************************

interface Data {
	addresses: Address[];
	defaults: Default[];
	socials: Social[];
	colors: {[key: string]: string};
	messages: {[key: string]: string};
	helps: Help;
	log: {[key: string]: string};
	miscellaneous: {[key: string]: string};
}

interface Address {
	location: string;
	display: string;
	value: string;
}

interface Default {
	item: string;
	label: string;
	value: string;
	prefix: boolean;
	required: boolean;
}

interface Social {
	name: string;
	url: string;
}

interface Help {
	title: string;
	sections: HelpSection[];
}

interface HelpSection {
	title: string;
	steps: Partial<HelpStep[]>;
}

interface HelpStep {
	title: string;
	image: string;
	description: string;
}

interface HelpTracker {
	current: number | null;
	previous: number | null;
}

type MessageType = 'success' | 'error';

// ****************************************************************
// VARIABLES
// ****************************************************************

let DATA: Partial<Data> = {};
let ELEMENTS: HTMLElement[];
let SIGNATURE: NodeListOf<Element>;

let helpTracker: HelpTracker = {
	previous: null,
	current: null
}

let helpStatus: boolean[] = [];

// ****************************************************************
// FUNCTIONS
// ****************************************************************

// ================================================
// Helpers
// ================================================

function $(selector: string): Element {
	return document.querySelector(selector) || undefined;
}

function $$(selector: string): NodeListOf<Element> {
	return document.querySelectorAll(selector) || undefined;
}

function setProperty(element: Element, property: string, value: string) {
	if (element) ((element as HTMLElement).style as any)[property] = value;
}

function showElement(element: Element, display: string = 'block') {
	setProperty(element, 'display', display);
}

function hideElement(element: Element) {
	setProperty(element, 'display', 'none');
}

function createElement(element: string): Element {
	return document.createElement(element);
}

function buildElement(root: Element, element: string, classes?: string[], content?: string): Element {
	const htmlElement = createElement(element);
	if(classes) classes.forEach(elementClass => htmlElement.classList.add(elementClass));
	if(content) htmlElement.innerHTML = content;
	root.appendChild(htmlElement);
	return htmlElement;
}

function getFormElements() {
	return [
		...(Array.from($$('input')) as HTMLInputElement[]),
		...(Array.from($$('select')) as HTMLSelectElement[])
	];
}

function query(data: any[], fromKey: string, fromValue: string, toKey: string) {
	return data.filter((item) => item[fromKey] === fromValue).map((item) => item[toKey])[0];
}

function setClipboard(text: any) {
	const type = 'text/html';
	const blob = new Blob([text], { type });
	// @ts-ignore
	const data = [new ClipboardItem({[type]: blob })];
	// @ts-ignore
	navigator.clipboard.write(data).then(
		/* success */
		() => {
			console.log(DATA.log.success);
		},
		/* failure */
		() => {
			console.warn(DATA.log.error);
		}
	)
}

// ================================================
// Handlers
// ================================================

// @ts-ignore
function handleSubmitForm(e: SubmitEvent) {
	e.preventDefault();
	parseEmail(($('.form__input--email') as HTMLInputElement).value);
	parseMobile();
	if (isFormValid()) {
		restoreSignature();
		initSignature();
		updateSignature();
		updateMarkup();
		updateMessage(DATA.messages.success, 'success');
	} else {
		updateMessage(DATA.messages.error, 'error');
	}
}

// ================================================
// Signature
// ================================================

function saveSignature(): NodeListOf<Element> {
	const signatureElements = $$('.signature__item');
	return signatureElements;
}

function restoreSignature() {
	const signatureData = $('.signature__data');
	while (signatureData.firstChild) {
		signatureData.removeChild(signatureData.firstChild);
	}
	SIGNATURE.forEach((item) => {signatureData.appendChild(item)});
}

// ================================================
// Initializers
// ================================================

function initController() {
	$$('.form__input').forEach((inputElement) => {
		inputElement.setAttribute(
			'placeholder',
			`${query(
				DATA.defaults,
				'item',
				inputElement.getAttribute('name'),
				'label'
			)}`
		);
	});
	$('.form__item--second').innerHTML = `@${DATA.miscellaneous.emailDomain}`;
}

function initAddresses() {
	const selector = $('.form__select--address') as HTMLSelectElement;
	DATA.addresses.forEach((item) => {
		selector.options[selector.options.length] = new Option(item.display)
	});
}

function initSignature() {
	$('.signature__web').setAttribute('href', DATA.miscellaneous.web);
	ELEMENTS.forEach((formElement) => {
		$(`.signature__item--${formElement.getAttribute('name')}`).innerHTML = query(
			DATA.defaults,
			'item',
			formElement.getAttribute('name'),
			'value'
		);
	});
}

// ================================================
// Factories
// ================================================

function factSocial() {
	const socialRoot = $('.signature__social');
	socialRoot.innerHTML = '';
	DATA.socials.forEach((item) => {
		const linkElement = createElement('a');
		linkElement.classList.add('signature__item');
		linkElement.setAttribute('href', item.url);
		linkElement.setAttribute('style', 'margin-right:1rem;');

		const imageElement = createElement('img');
		imageElement.setAttribute('src', `${DATA.miscellaneous.assetRoot}/social-${item.name.toLowerCase()}@2x.png`);
		imageElement.setAttribute('alt', `${item.name}`);
		imageElement.setAttribute('style', 'width:1rem;height:1rem;');

		linkElement.appendChild(imageElement);
		socialRoot.appendChild(linkElement);
	});
}

function factHelp() {
	const helpRoot = $('.help__inside');
	buildElement(helpRoot, 'h2', ['help__title'], DATA.helps.title);
	const sectionsElement = buildElement(helpRoot, 'div', ['help__sections']);
	DATA.helps.sections.forEach((contentItem, index) => {
		const sectionElement = buildElement(sectionsElement, 'div', ['help__section', `help__section--${index}`]);
		buildElement(sectionElement, 'h3', ['help__section-title'], contentItem.title);
		helpStatus.push(false);
		const sectionStepsElement = buildElement(sectionElement, 'div', ['help__steps']);
		hideElement(sectionStepsElement);
		(sectionElement as HTMLElement).onclick = () => {
			helpTracker.previous = helpTracker.current;
			helpTracker.current = index;
			console.log(helpTracker);
			if (helpTracker.previous !== helpTracker.current) {
				helpStatus[helpTracker.previous] = false;
				helpStatus[helpTracker.current] = true;
				if (helpTracker.previous !== null) { $(`.help__section--${helpTracker.previous} .help__section-title`).classList.toggle('help__section-title--opened'); }
				if (helpTracker.current !== null) { $(`.help__section--${helpTracker.current} .help__section-title`).classList.toggle('help__section-title--opened'); }
				if (helpTracker.previous !== null) { hideElement($(`.help__section--${helpTracker.previous} .help__steps`)); }
				showElement($(`.help__section--${helpTracker.current} .help__steps`));
			} else {
				if (helpTracker.current !== null) { $(`.help__section--${helpTracker.current} .help__section-title`).classList.toggle('help__section-title--opened'); }
				switch (helpStatus[helpTracker.current]) {
					case false:
						helpStatus[helpTracker.current] = true;
						showElement($(`.help__section--${helpTracker.current} .help__steps`));
						break;
					case true:
						helpStatus[helpTracker.current] = false;
						hideElement($(`.help__section--${helpTracker.current} .help__steps`));
						break;
				}
			}
		}
		contentItem.steps.forEach((contentSubItem) => {
			buildElement(sectionStepsElement, 'h4', null, contentSubItem.title);
			const sectionStepElementImage = buildElement(sectionStepsElement, 'img', ['help__step-image']);
			sectionStepElementImage.setAttribute('src', contentSubItem.image);
			sectionStepElementImage.setAttribute('alt', contentSubItem.title);
			buildElement(sectionStepsElement, 'p', ['help__step-description'], contentSubItem.description);
		});
	});
}

// ================================================
// Validators
// ================================================

function isFormValid(): boolean {
	// const inputElements = Array.from($$('input'))  as HTMLInputElement[];
	// const requiredElements = inputElements.filter((element) => element.required);
	// console.log(requiredElements);
	const requiredElements = DATA.defaults
		.filter((item) => item.required)
		.map((item) => item.item)
		.map((element) => $('.form__check--' + element) as HTMLInputElement);
	// console.log(requiredElements.forEach((element) => element.value));
	// console.log(requiredElements);
	// const requiredElementsValues = requiredElements.map((element) => element.value ? element.value : undefined);
	// console.log(requiredElementsValues);
	return true;
}

// ================================================
// Parsers
// ================================================

function parseEmail(email: string): string {
	const userNameIndex = email.indexOf('@') !== -1 ? email.indexOf('@') : email.length;
	const userName = email.substr(0, userNameIndex);
	return `${userName}@${DATA.miscellaneous.emailDomain}`;
}

function parseMobile(): string {
	// ToDo
	return '';
}

// ================================================
// Updaters
// ================================================

function updateSignature() {
	const fieldsWithPrefixes = DATA.defaults.filter((item) => item.prefix).map((item) => item.item);
	ELEMENTS.forEach(field => {
		if(field instanceof HTMLInputElement) {
			if(field.value) {
				let value: string;
				if (field.name === 'email') {
					value = parseEmail(field.value);
					$(`.signature__item--${field.name}`).setAttribute('href', `mailto:${value}`);
				} else {
					value = field.value;
				}
				$(`.signature__item--${field.name}`).innerHTML =
					fieldsWithPrefixes.indexOf(field.name) === -1 ? value : $(`.signature__item--${field.name}`).innerHTML + value;
			} else {
				$('.signature__data').removeChild($(`.signature__item--${field.name}`));
			}
		}
		if(field instanceof HTMLSelectElement) {
			$(`.signature__item--${field.name}`).innerHTML = query(
				DATA.addresses,
				'display',
				field.options[field.selectedIndex].text,
				'value'
			);
		}
	});
	const content = $('.signature__content').innerHTML
		.replace(/class="[^"]*"/g, '')
		.replace('&nbsp;', '#$%')
		.replace(/[ ]+/g, ' ')
		.replace(/<[ ]*/g, '<')
		.replace(/[ ]*>/g, '>')
		.replace('#$%', '&nbsp;');
	setClipboard(content);
	$('.markup').textContent = content.split('\n').map(line => line.trim()).filter(line => line !== '').join('');
}

function updateMarkup() {
	const markupElement = $('.markup');
	if (!markupElement.getAttribute('contenteditable')) markupElement.setAttribute('contenteditable', 'true');
}

function updateMessage(messageText: string, messageType: MessageType) {
	const messageElement = $('.message');
	showElement(messageElement);
	messageElement.innerHTML = messageText;
	(messageElement as HTMLElement).style.color = DATA.colors[messageType];
	(messageElement as HTMLElement).style.borderColor = DATA.colors[messageType];
}

// ****************************************************************
// MAIN ENTRY POINT
// ****************************************************************

function main() {
	console.log('jupiter and saturn');
	fetch('./data.json')
		.then(response => response.json())
		.then(data => DATA = data)
		.then(_ => ELEMENTS = getFormElements())
		.then(() => initController())
		.then(() => initAddresses())
		.then(() => initSignature())
		.then(() => factSocial())
		.then(() => factHelp())
		.then(() => SIGNATURE = saveSignature())
		.then(() => hideElement($('.message')))
		.then(() => $('.form').addEventListener('submit', handleSubmitForm))
		.then(() => setProperty($('.app'), 'opacity', '1'))
		.then(() => setProperty($('.help'), 'opacity', '1'));
}

main();
