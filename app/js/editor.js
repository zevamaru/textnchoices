class TextsNChoices {
	constructor() {
		this.eventHandler = new EventHandler(this);
		this.canvas = document.querySelector('#canvas');
		this.grid = document.querySelector('#grid');
		this.scroll = { top: 0, left: 0 };
		this.click = { x: 0, y: 0, bbox: null };
		this.target = false;
		this.data = {
			name: 'Story Name',
			author: 'Author',
			editor: [],
			player: [],
		};
		this.debug();
		this.load();
	}

	select(el) {
		if (el.id === "btnAddChoice") {
			return;
		}
		if (el && this.target != el) {
			this.unselect(this.target);
			this.target = el;
			if (el.classList.contains('item') || el.classList.contains('choice')) {
				el.classList.add('selected');
				let btnAddChoice = document.querySelector('#btnAddChoice');
				btnAddChoice.classList.remove('disabled');
			}
			//console.log(this.target);
		}
	}

	unselect(el) {
		if (el) {
			this.target = false;
			if (el.classList.contains('item') || el.classList.contains('choice')) {
				el.classList.remove('selected');
				let btnAddChoice = document.querySelector('#btnAddChoice');
				btnAddChoice.classList.add('disabled');
			}
			// this.grid.unselect(el);
		}
	}

	drag(dx, dy) {
		// console.log('dragging element: ' + this.target.id);
		this.canvas.style.cursor = 'grabbing';
		if (this.target.id === 'grid') {
			this.canvas.scrollLeft = this.scroll.left - dx;
			this.canvas.scrollTop = this.scroll.top - dy;
		}
		if (this.target.classList.contains('item')) {
			this.target.style.left = this.click.bbox.left + this.scroll.left + dx + 'px';
			this.target.style.top = this.click.bbox.top + this.scroll.top - 40 + dy + 'px';
		}
	}

	debug() {
		// let data = {};
		//this.grid.debug(data);
	}

	async import(filename) {
		if (filename) {
			this.filename = filename;
		}
		const response = await fetch('/data/' + this.filename + '.json');
		this.data = await response.json();
		this.renderData(this.data.grid);
	}

	export() {
		console.log('Exportar');
		const jsonString = JSON.stringify(this.data);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'story.json';
		a.click();
	}

	get() {
		return this.data;
	}

	uniqueID() {
		let randomstr = (Date.now().toString(36) + Math.random().toString(36)).substring(4, 9);
		let id = 'item_' + randomstr;
		return id;
	}

	getChoiceID() {
		return { id: 1, number: 1 };
	}

	newText() {
		this.renderItem({ id: this.uniqueID(), x: '500px', y: '300px', description: 'Click here to edit your text.' });
	}

	addChoice() {
		if (this.target.classList.contains('item')) {
			let target = this.target;
			let id = this.getChoiceID();
			let option = `<li id="${id.id}" data-link-to="" class="editable choice">Choice ID: ${id.number}</li>`;
			let el = this.target.querySelector('.options');
			el.innerHTML += option;
			this.target = target;
		}
	}

	load() {
		console.log('>>>> Load')
		let data = localStorage.getItem('TextNChoices');
		if (data) {
			this.data = JSON.parse(data);
			this.renderData(this.data.editor);
		}
		console.log(data)
	}

	save() {
		console.log('>>>> Save')
		// Generate editor data
		let els = this.grid.getElementsByClassName('item');
		let grid = [];		
		for (let i = 0; i < els.length; i++) {
			let grid_item = {
				id: els[i].getAttribute('id'),
				x: els[i].style.left,
				y: els[i].style.top,
				description: els[i].getElementsByClassName('text')[0].innerHTML,
			};
			grid.push(grid_item);
		}
		this.data.editor = grid;
		const data = JSON.stringify(this.data);
		localStorage.setItem('TextNChoices', data);
		console.log(data);
	}

	saveChoice() {
		console.log('save choice');
		// obtener datos
		// guardar datos en variable this.data
		// actualizar html
	}

	openText(id) {
		console.log(">>>> Open text");
		let text = this.data.player.find(text => text.id === id);
		if (!text){
			text = {
				"id": id,
				"content": '',
			}
		}
		$inputTextCurrentId.value = text.id;
		$inputTextId.value = text.id;
		$inputText.value = text.content;
		$textForm.classList.remove('hide');
	}

	saveText() {
		let text = this.data.player.find(text => text.id === $inputTextCurrentId.value);
		let item = this.data.editor.find(item => item.id === $inputTextCurrentId.value);
		let el = document.getElementById($inputTextCurrentId.value);
		const formData = {
			"id": $inputTextId.value,
			"content": $inputText.value,
		}
		if (text) {
			console.log('>>>> Modify');
			let index = this.data.player.indexOf(text);
			this.data.player[index] = formData;
		} else {
			console.log('>>>> Create');
			this.data.player.push(formData);
		}
		let description = false;
		if (formData.content){
			description = '"' + formData.content.slice(0, 28) + '..."';
		}
		el.remove();
		this.renderItem({
			id: formData.id,
			x: item.x,
			y: item.y,
			description: description || item.description
		});
		$textForm.classList.add('hide');
		this.save();
	}

	removeText(id){
		const text = this.data.player.find(text => text.id === id);
		let index = this.data.player.indexOf(text);
		this.data.player.splice(index, 1);
		let item = this.grid.querySelector('#' + id);
		item.remove();
		this.save();
	}

	cancel() {
		let textEditor = document.getElementById('text_editor');
		let choiceEditor = document.getElementById('choice_editor');
		textEditor.classList.add('hide');
		choiceEditor.classList.add('hide');
	}

	remove() {
		if (this.target.classList.contains('item')) {
			this.removeText(this.target.id);
			this.target.remove();
			this.unselect(this.target);
		}
	}

	item(itemData) {
		let item = `
        <div id="${itemData.id}" class="item" style="top: ${itemData.y}; left: ${itemData.x};">
          ID: ${itemData.id}
          <p class="text editable" onClick="app.openText('${itemData.id}')">${itemData.description}</p>
          <ul class="options">
          </ul>
        </div>
        `;
		return item;
	}

	renderItem(itemData) {
		let item = this.item(itemData);
		this.grid.innerHTML += item;
	}

	renderData(data) {
		let items = ``;
		for (var i = 0; i < data.length; i++) {
			let itemData = data[i];
			items += this.item(itemData);
		}
		this.grid.innerHTML = items;
	}
}

class EventHandler {
	constructor(app) {
		this.app = app;
		this.mouseDown = this.handleMouseDown.bind(this);
		this.mouseMove = this.handleMouseMove.bind(this);
		this.mouseUp = this.handleMouseUp.bind(this);
		this.keyDown = this.handleKeyDown.bind(this);
		document.addEventListener('pointerdown', this.mouseDown);
		document.addEventListener('keydown', this.keyDown);
	}

	handleMouseDown(event) {
		if (event.which == 2) {
			event.preventDefault();
			return;
		}
		this.app.select(event.target);
		this.app.click = { x: event.clientX, y: event.clientY, bbox: this.app.target.getBoundingClientRect() };
		this.app.scroll = { top: this.app.canvas.scrollTop, left: this.app.canvas.scrollLeft };
		document.addEventListener('pointermove', this.mouseMove);
		document.addEventListener('pointerup', this.mouseUp);
	}

	handleMouseMove(event) {
		let dx = event.clientX - this.app.click.x;
		let dy = event.clientY - this.app.click.y;
		this.app.drag(dx, dy);
	}

	handleMouseUp() {
		this.app.scroll = { top: this.app.canvas.scrollTop, left: this.app.canvas.scrollLeft };
		this.app.canvas.style.cursor = 'grab';
		document.removeEventListener('pointermove', this.mouseMove);
		document.removeEventListener('pointerup', this.mouseUp);
	}

	handleKeyDown(event) {
		if (event.code === 'Delete' || event.code === 'Backspace') {
			this.app.remove();
		}
	}
}

const app = new TextsNChoices();

const $textForm = document.querySelector('#text_editor');
const $inputTextCurrentId = document.querySelector('#text_editor_current_id');
const $inputTextId = document.querySelector('#text_editor_id');
const $inputText = document.querySelector('#text_editor_text');